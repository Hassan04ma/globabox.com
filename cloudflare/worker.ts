import { PRODUCTS, CATEGORIES } from '../src/data';
import { STORE_DEPARTMENTS } from '../src/storefrontDepartments';
import { DEFAULT_TRACKING_CONFIG, validateTrackingConfig } from '../src/trackingConfig';
import { isAdmin, handleAdminAuth } from './auth';
import { quoteOrder } from './orderQuote';

interface Env { ADMIN_RATE_LIMITER?: {limit: (options:{key:string}) => Promise<{success:boolean}>}; CHECKOUT_RATE_LIMITER?: {limit: (options:{key:string}) => Promise<{success:boolean}>}; DB: D1Database; ASSETS: Fetcher; ADMIN_USERNAME?: string; ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string; ADMIN_API_KEY?: string; STORE_ACCEPTING_ORDERS?: string; STORE_DEMO_CATALOG?: string; AMEEX_API_ID?: string; AMEEX_API_KEY_TEST?: string }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const MAX_JSON_BYTES = 64 * 1024;
const readBody = async (request: Request) => {
  try {
    if (Number(request.headers.get('content-length') || 0) > MAX_JSON_BYTES) return null;
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES) return null;
    return JSON.parse(raw) as any;
  } catch { return null; }
};
const publicProduct = (p: any) => p && p.isActive !== false;
// AMEEX /Delivery/Cities returns {type:"success",cities:{"63":{id:63,name:"Agadir"},...}}.
// Verify every entry before using its ID. No raw response or credentials are exposed.
function ameexCities(raw: unknown): Array<{id:number;name:string}> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const response=raw as Record<string,unknown>;
  if (response.type !== 'success') return null;
  const cities=response.cities;
  if (!cities || typeof cities !== 'object' || Array.isArray(cities)) return null;
  const entries=Object.entries(cities as Record<string,unknown>);
  if (!entries.length) return null;
  const normalized:Array<{id:number;name:string}>=[];
  for (const [key,val] of entries) {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return null;
    const item=val as Record<string,unknown>;
    const id=Number(item.id);
    if (!/^[1-9][0-9]*$/.test(key) || !Number.isSafeInteger(id) || id<=0 ||
        id!==Number(key) || typeof item.name!=='string' || !item.name.trim()) return null;
    normalized.push({id,name:item.name.trim()});
  }
  return normalized;
}


type CategoryRecord = {
  id: string;
  name: {fr:string;ar:string;en:string};
  image: string;
  description: {fr:string;ar:string;en:string};
  isActive: boolean;
};
const CATEGORY_ID_RE = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const MAX_CATEGORY_TEXT = 200;
const categoryText = (value: unknown, max = MAX_CATEGORY_TEXT) =>
  typeof value === 'string' ? value.trim().slice(0,max) : '';
const safeCategoryImage = (value: unknown) => {
  if (typeof value !== 'string' || value.length > 1500) return false;
  if (/^\/api\/product-media\/[a-f0-9-]{36}$/.test(value)) return true;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
};
function parseCategoryPayload(payload:any, fallback?:CategoryRecord):CategoryRecord|null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const id = categoryText(payload.id,64);
  const fr=categoryText(payload.name?.fr);
  const ar=categoryText(payload.name?.ar);
  const en=categoryText(payload.name?.en);
  const image=typeof payload.image==='string'?payload.image.trim():'';
  if (!CATEGORY_ID_RE.test(id) || !fr || !image || !safeCategoryImage(image)) return null;
  const description = {
    fr:categoryText(payload.description?.fr,500),
    ar:categoryText(payload.description?.ar,500),
    en:categoryText(payload.description?.en,500)
  };
  return {id,name:{fr,ar:ar||fr,en:en||fr},image,description,
    isActive:typeof payload.isActive==='boolean'?payload.isActive:(fallback?.isActive??true)};
}
async function categoryList(db:D1Database, includeInactive=false):Promise<CategoryRecord[]> {
  // Overrides allow editing builtin categories without deleting their defaults.
  await db.prepare('CREATE TABLE IF NOT EXISTS category_overrides (id TEXT PRIMARY KEY, data_json TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
  const rows=await db.prepare('SELECT id,data_json,active FROM category_overrides').all<{id:string;data_json:string;active:number}>();
  const overrides=new Map<string,CategoryRecord>();
  for(const row of rows.results) {
    try { const parsed=JSON.parse(row.data_json) as CategoryRecord;
      overrides.set(row.id,{...parsed,isActive:row.active===1}); }
    catch { console.error('Invalid category override',row.id); }
  }
  const fromDefault=[...STORE_DEPARTMENTS, ...CATEGORIES.filter(cat=>!STORE_DEPARTMENTS.some(dept=>dept.id===cat.id))].map(cat=>({
    id:cat.id,name:cat.name,image:cat.image,
    description:cat.description||{fr:'',ar:'',en:''},isActive:true
  }));
  const all=fromDefault.map(cat=>overrides.get(cat.id)||cat);
  const ids=new Set(fromDefault.map(cat=>cat.id));
  for(const [id,cat] of overrides) if(!ids.has(id)) all.push(cat);
  // Historic camping departments remain available in the admin for data safety,
  // but are never accidentally made public by the new storefront.
  const mainIds=new Set(STORE_DEPARTMENTS.map(dept=>dept.id));
  return includeInactive?all:all.filter(cat=>cat.isActive && mainIds.has(cat.id));
}

const auth = isAdmin;
async function importAuthorized(request: Request, env: Env): Promise<boolean> {
  if (await auth(request, env)) return true;
  const key = request.headers.get('x-admin-api-key');
  if (!key || !env.ADMIN_API_KEY || env.ADMIN_API_KEY.length < 32 || key.length !== env.ADMIN_API_KEY.length) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(key)),
    crypto.subtle.digest('SHA-256', encoder.encode(env.ADMIN_API_KEY)),
  ]);
  const left = new Uint8Array(a), right = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}
async function listProducts(db: D1Database, includeDrafts: boolean, allowDemoCatalog = false) {
  const rows = await db.prepare(includeDrafts ? 'SELECT data_json FROM products ORDER BY created_at DESC' : 'SELECT data_json FROM products WHERE active = 1 ORDER BY created_at DESC').all<{ data_json: string }>();
  const databaseProducts = rows.results.map(x => JSON.parse(x.data_json));
  // Never sell bundled sample products in production just because D1 has no
  // inventory yet. Opt-in remains available solely for isolated smoke tests.
  if (!allowDemoCatalog) return databaseProducts.filter(p => includeDrafts || publicProduct(p));
  const ids = await db.prepare('SELECT id FROM products').all<{id:string}>();
  const storedIds = new Set(ids.results.map(p => p.id));
  return [...databaseProducts.filter(p => includeDrafts || publicProduct(p)),
    ...PRODUCTS.filter(p => (includeDrafts || publicProduct(p)) && !storedIds.has(p.id))];
}
// Used by both public COD checkout and the admin's isolated diagnostic.
// Never acknowledge a customer order until D1 confirms the write and readback.
async function persistValidatedOrder(db: D1Database, priced: Extract<ReturnType<typeof quoteOrder>,{ok:true}>, diagnostic = false) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    ...priced.order,
    id, reference: 'GB-' + id.slice(0,8).toUpperCase(),
    date:now, createdAt:now, status:'pending',
    paymentMethod:'Cash on delivery', source:diagnostic ? 'admin-checkout-diagnostic' : 'website',
    syncStatus:'synced', ...(diagnostic ? {diagnostic:true} : {})
  };
  const written = await db.prepare('INSERT INTO orders (id,status,total_mad,data_json) VALUES (?,?,?,?)')
    .bind(id,'pending',record.total,JSON.stringify(record)).run();
  if (!written.success || written.meta?.changes !== 1)
    throw new Error('D1 did not confirm checkout write');
  const row = await db.prepare('SELECT data_json FROM orders WHERE id=?')
    .bind(id).first<{data_json:string}>();
  if (!row) throw new Error('D1 checkout readback missing');
  const saved = JSON.parse(row.data_json);
  if (saved.id !== id || saved.total !== record.total || saved.items?.length !== record.items.length)
    throw new Error('D1 checkout readback mismatch');
  return record;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (method === 'POST' && (path === '/api/admin/login' || path === '/api/orders' || path === '/api/track-order')) {
      const limiter = path === '/api/admin/login' ? env.ADMIN_RATE_LIMITER : env.CHECKOUT_RATE_LIMITER;
      // Fail closed for production request endpoints when the anti-abuse binding is missing.
      if (!limiter) return json({error:'Service temporarily unavailable'},503);
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const result = await limiter.limit({key: path === '/api/track-order' ? 'tracking:' + ip : ip});
      if (!result.success) return json({error:'Too many requests. Try again later.'},429);
    }
    // Image uploads use a separate 750 KB limit and never go through JSON parsing.
    if (path === '/api/admin/media' && method === 'POST' &&
        Number(request.headers.get('content-length') || 0) > 750_000)
      return json({error:'Image too large (max 750 KB)'},413);
    if (['POST','PUT','PATCH'].includes(method) && path !== '/api/admin/media' &&
        Number(request.headers.get('content-length') || 0) > MAX_JSON_BYTES)
      return json({error:'Request body too large'},413);
    if (path === '/api/launch-readiness' && method === 'GET') {
      // Safe public preflight: no tokens, credentials, order data or table contents.
      const adminConfigured = !!(env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length >= 12 &&
        env.ADMIN_SESSION_SECRET && env.ADMIN_SESSION_SECRET.length >= 32);
      let databaseReady = false;
      try {
        if (env.DB) {
          await env.DB.prepare('SELECT id FROM orders LIMIT 0').all();
          await env.DB.prepare('SELECT id FROM products LIMIT 0').all();
          databaseReady = true;
        }
      } catch (err) {
        console.error('[GLOBABOX] Launch readiness database check failed', err);
      }
      return json({
        status: adminConfigured && databaseReady
          ? (env.STORE_ACCEPTING_ORDERS === 'true' ? 'checkout_enabled_unverified' : 'backend_ready_checkout_closed')
          : 'not_ready',
        databaseReady, adminConfigured,
        checkoutEnabled: env.STORE_ACCEPTING_ORDERS === 'true',
        demoCatalogEnabled: env.STORE_DEMO_CATALOG === 'true',
        checkoutVerified: false,
        note: 'A working D1 connection is not proof that a real checkout order was persisted. Do not cut over until verified.'
      }, databaseReady && adminConfigured ? 200 : 503);
    }
    const authResponse = await handleAdminAuth(request, env);
    if (authResponse) return authResponse;
    if (!env.DB) return json({ error: 'Database binding missing' }, 503);
    try {
      // Serve uploaded product imagery from a small D1-backed media store.
      // Large-scale catalogs should migrate media to Cloudflare R2.
      const mediaMatch = path.match(/^\/api\/product-media\/([a-f0-9-]{36})$/);
      if (mediaMatch && method === 'GET') {
        const row = await env.DB.prepare('SELECT content_type,body FROM product_media WHERE id=?')
          .bind(mediaMatch[1]).first<{content_type:string;body:number[]}>();
        if (!row || !Array.isArray(row.body)) return json({error:'Image not found'},404);
        return new Response(Uint8Array.from(row.body), {
          headers: {'Content-Type':row.content_type,'X-Content-Type-Options':'nosniff',
            'Cache-Control':'public, max-age=86400'}
        });
      }
      if (path === '/api/admin/media' && method === 'POST') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        const mime = request.headers.get('content-type') || '';
        if (!['image/webp','image/jpeg','image/png'].includes(mime))
          return json({error:'JPG, PNG or WebP required'},415);
        const bytes = new Uint8Array(await request.arrayBuffer());
        if (!bytes.length || bytes.length > 750_000) return json({error:'Image too large (max 750 KB)'},413);
        const jpeg = mime==='image/jpeg' && bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
        const png = mime==='image/png' && bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71;
        const webp = mime==='image/webp' && String.fromCharCode(...bytes.slice(0,4))==='RIFF' &&
          String.fromCharCode(...bytes.slice(8,12))==='WEBP';
        if (!(jpeg||png||webp)) return json({error:'Invalid image signature'},400);
        await env.DB.prepare(
          'CREATE TABLE IF NOT EXISTS product_media (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, body BLOB NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'
        ).run();
        const id = crypto.randomUUID();
        const written = await env.DB.prepare(
          'INSERT INTO product_media (id,content_type,body) VALUES (?,?,?)'
        ).bind(id,mime,bytes).run();
        if (!written.success) return json({error:'Media was not saved'},503);
        return json({url:new URL('/api/product-media/'+id,request.url).href,id},201);
      }
      if (path === '/api/admin/ameex-sandbox-status' && method === 'GET') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        // Read-only integration probe. Never create parcels or contact production APIs.
        const configured = !!(env.AMEEX_API_ID && env.AMEEX_API_KEY_TEST?.startsWith('test_'));
        return json({
          configured,
          environment:'sandbox',
          apiBase:'https://api.ameex.app/customer',
          mode:'read-only',
          outboundParcelsEnabled:false,
          note: configured ? 'Test credentials configured. Use the read-only cities probe.' : 'Add AMEEX_API_ID and the sandbox AMEEX_API_KEY_TEST as Cloudflare Production secrets.',
        });
      }
      if (path === '/api/admin/ameex-sandbox-cities' && method === 'GET') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        if (!env.AMEEX_API_ID || !env.AMEEX_API_KEY_TEST?.startsWith('test_'))
          return json({error:'AMEEX sandbox test credentials not configured'},503);
        try {
          const upstream = await fetch('https://api.ameex.app/customer/Delivery/Cities',{
            method:'GET',
            headers:{'C-Api-Id':env.AMEEX_API_ID,'C-Api-Key':env.AMEEX_API_KEY_TEST,'Accept':'application/json'},
            signal:AbortSignal.timeout(10000)
          });
          if (!upstream.ok) return json({success:false,upstreamStatus:upstream.status,error:'AMEEX cities request failed'},502);
          const data:unknown = await upstream.json();
          if (data && typeof data==='object' && !Array.isArray(data) &&
             ('login' in data || 'api' in data) && !('cities' in data)) {
            // AMEEX may return an HTTP 200 response containing an auth/error envelope.
            // Do not expose values: they could contain sensitive implementation data.
            return json({success:false,reachable:true,authenticationUnverified:true,
              error:'AMEEX returned login/api envelope instead of cities. Verify sandbox API credentials and business selection; no parcel created.'},502);
          }
          const list=ameexCities(data);
          const count=list?.length ?? null;
          return json({success:count!==null,reachable:true,environment:'sandbox',citiesCount:count,
            error:count===null?'AMEEX cities response not recognized. No parcel created.':undefined,
            responseShape:count===null?{rootType:Array.isArray(data)?'array':typeof data,rootKeys:data&&typeof data==='object'&&!Array.isArray(data)?Object.keys(data as Record<string,unknown>).slice(0,12):[],citiesType:data&&typeof data==='object'&&!Array.isArray(data)?(Array.isArray((data as Record<string,unknown>).cities)?'array':typeof (data as Record<string,unknown>).cities):'absent',citiesCount:data&&typeof data==='object'&&!Array.isArray(data)&&(data as Record<string,unknown>).cities&&typeof (data as Record<string,unknown>).cities==='object'?Object.keys((data as Record<string,unknown>).cities as Record<string,unknown>).length:null}:undefined,
            note:count===null?'AMEEX returned a response but city IDs are not validated.':'Validated AMEEX city IDs; no parcel created.'},count===null?502:200);
        } catch (err) {
          console.error('AMEEX sandbox cities read failed',err);
          return json({success:false,error:'AMEEX sandbox connectivity failed'},502);
        }
      }
      if (path === '/api/admin/ameex-sandbox-parcel' && method === 'POST') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        if (!env.AMEEX_API_ID || !env.AMEEX_API_KEY_TEST?.startsWith('test_'))
          return json({error:'Test credentials missing'},503);
        // Never consume customer orders or create a production shipment.
        // A test_ key is essential; the caller cannot supply arbitrary credentials.
        const headers={'C-Api-Id':env.AMEEX_API_ID,'C-Api-Key':env.AMEEX_API_KEY_TEST,'Accept':'application/json'};
        try {
          const c=await fetch('https://api.ameex.app/customer/Delivery/Cities',{headers,signal:AbortSignal.timeout(10000)});
          if(!c.ok) return json({error:'Cities unavailable; no parcel created',upstreamStatus:c.status},502);
          const raw:unknown=await c.json();
          if(raw && typeof raw==='object' && !Array.isArray(raw) &&
             ('login' in raw || 'api' in raw) && !('cities' in raw))
            return json({error:'AMEEX did not return authorized cities; no parcel created'},409);
          const cities=ameexCities(raw);
          if(!cities?.length) return json({error:'City list not validated; no parcel created'},409);
          const agadir=cities.find(c=>c.name.toLowerCase()==='agadir');
          if(!agadir) return json({error:'Agadir not found in AMEEX city list; no parcel created'},409);
          const cityId=agadir.id;
          // Reserve the one permitted outbound attempt ONLY once local validation
          // succeeded. A read-only discovery error must not consume the allowance.
          await env.DB.prepare('CREATE TABLE IF NOT EXISTS integration_diagnostics (id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
          const diagnosticId='ameex-sandbox-parcel-v1';
          const guard=await env.DB.prepare('INSERT OR IGNORE INTO integration_diagnostics (id) VALUES (?)').bind(diagnosticId).run();
          if(guard.meta?.changes!==1) return json({error:'Sandbox parcel was already attempted; no duplicate submission allowed.'},409);
          const form=new URLSearchParams({
            type:'SIMPLE',receiver:'TEST GLOBABOX SANDBOX NE PAS LIVRER',
            phone:'0600000000',city:String(cityId),cod:'1',
            address:'ADRESSE FICTIVE TEST SANDBOX - NE PAS EXPEDIER',
            product:'TEST TECHNIQUE SANDBOX - AUCUN PRODUIT',
            comment:'SANDBOX UNIQUEMENT - NE PAS LIVRER',order_num:'GB-SBX-DIAGNOSTIC-01'
          });
          const resp=await fetch('https://api.ameex.app/customer/Delivery/Parcels/Action/Type/Add',{
            method:'POST',headers:{...headers,'Content-Type':'application/x-www-form-urlencoded'},
            body:form,signal:AbortSignal.timeout(15000)
          });
          const result:any=await resp.json().catch(()=>null);
          // Avoid leaking third-party response, identifiers, or unexpected PII.
          return json({sandbox:true,attempted:true,httpStatus:resp.status,
            accepted:resp.ok && (result?.success===true || result?.Success===true || result?.status===true),
            note:'Synthetic sandbox submission only. No customer order processed. Further attempts disabled.'},resp.ok?200:502);
        }catch(err){
          console.error('AMEEX sandbox parcel probe failed',err);
          return json({error:'Sandbox probe failed or timed out; it may have been submitted. No automatic retry.',attempted:true},502);
        }
      }
      if (path === '/api/admin/checkout-diagnostic' && method === 'POST') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        // Read real production product and shipping rules, without ever making
        // the Draft product public or enabling customer orders.
        const result = await env.DB.prepare('SELECT data_json FROM products WHERE id=?')
          .bind('camel-electron-40').first<{data_json:string}>();
        if (!result) return json({error:'CAMEL ELECTRON 40 missing from D1'},409);
        const product = JSON.parse(result.data_json);
        if (!product?.name?.fr || !Number.isFinite(product.price) || product.price <= 0 ||
            product.inStock !== true || product.stockStatus === 'out_of_stock')
          return json({error:'Product price or stock not yet ready'},409);
        const subtotal = product.price;
        const shippingCost = subtotal >= 500 ? 0 : 35;
        const data = {
          fullName:'GLOBABOX DIAGNOSTIC NE PAS LIVRER',
          phoneNumber:'0600000000',city:'Diagnostic',
          deliveryAddress:'Commande technique fictive, ne jamais expedier',
          items:[{productId:'camel-electron-40',quantity:1}],
          subtotal,shippingCost,total:subtotal+shippingCost
        };
        const quote = quoteOrder(data,[{...product,isActive:true}]);
        if ('error' in quote) return json({error:'COD quote failed',reason:quote.error},409);
        // Verify an altered customer total would be rejected.
        const tampered = quoteOrder({...data,total:1},[{...product,isActive:true}]);
        if (!('error' in tampered) || tampered.status !== 409)
          return json({error:'Tampered checkout was not rejected'},503);
        let orderId:string|undefined;
        let cleaned=false;
        try {
          const record = await persistValidatedOrder(env.DB,quote,true);
          orderId=record.id;
          const removed=await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(orderId).run();
          const leftovers=await env.DB.prepare('SELECT id FROM orders WHERE id=?')
            .bind(orderId).first();
          cleaned=removed.success && !leftovers;
          if (!cleaned) return json({error:'Diagnostic cleanup not confirmed; check orders immediately'},503);
          return json({
            success:true,quoteVerified:true,priceTamperingRejected:true,
            orderWrittenAndReadBack:true,cleanupVerified:true,
            productId:'camel-electron-40',unitPrice:record.subtotal,
            shippingCost:record.shippingCost,total:record.total,
            publicCheckoutEnabled:env.STORE_ACCEPTING_ORDERS === 'true',
            note:'Admin-only synthetic checkout checked actual product pricing and D1. Does not test the public browser flow.'
          });
        } finally {
          // Best-effort cleanup even if readback or another step failed.
          // If this fails, diagnostic rows are visibly tagged.
          if (orderId && !cleaned)
            await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(orderId).run().catch(
              err=>console.error('Diagnostic cleanup failed',err)
            );
        }
      }
      if (path === '/api/admin/verify-d1-write' && method === 'POST') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        // A disposable synthetic record tests the real remote orders table,
        // without collecting customer details or enabling public checkout.
        const id = 'd1_probe_' + crypto.randomUUID();
        const probe = JSON.stringify({id,diagnostic:true,createdAt:new Date().toISOString()});
        let writeVerified = false;
        let cleanupVerified = false;
        try {
          const inserted = await env.DB.prepare(
            'INSERT INTO orders (id,status,total_mad,data_json) VALUES (?,?,?,?)'
          ).bind(id,'diagnostic',0,probe).run();
          if (!inserted.success) throw new Error('D1 diagnostic insert failed');
          const saved = await env.DB.prepare('SELECT data_json FROM orders WHERE id=?')
            .bind(id).first<{data_json:string}>();
          writeVerified = saved?.data_json === probe;
        } finally {
          const removed = await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(id).run();
          const remaining = await env.DB.prepare('SELECT id FROM orders WHERE id=?')
            .bind(id).first();
          cleanupVerified = removed.success && !remaining;
        }
        return json({
          databaseWriteVerified:writeVerified && cleanupVerified,
          cleanupVerified,
          checkoutVerified:false,
          note:'Remote D1 insert/read/delete check only. This is not an end-to-end customer checkout test.'
        },writeVerified && cleanupVerified ? 200 : 503);
      }

      // Store tracking settings are public IDs (not passwords, tokens or webhooks).
      // They are persisted in D1 and served to all storefront clients, so the
      // admin's browser is never used as the source of truth.
      if ((path === '/api/tracking-config' || path === '/api/admin/tracking-config') &&
          (method === 'GET' || method === 'PUT')) {
        if (method === 'PUT' && path !== '/api/admin/tracking-config')
          return json({error:'Not found'},404);
        if (path.startsWith('/api/admin/') && !await auth(request,env))
          return json({error:'Unauthorized'},401);
        await env.DB.prepare('CREATE TABLE IF NOT EXISTS store_settings (key TEXT PRIMARY KEY, data_json TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)').run();
        if (method === 'GET') {
          const found=await env.DB.prepare("SELECT data_json FROM store_settings WHERE key='tracking-config' LIMIT 1")
            .first<{data_json:string}>();
          let config={...DEFAULT_TRACKING_CONFIG};
          if (found?.data_json) {
            try {config=validateTrackingConfig(JSON.parse(found.data_json)) || config;}
            catch {console.error('Invalid tracking settings data in D1');}
          }
          return json({config});
        }
        const submitted=validateTrackingConfig(await readBody(request));
        if (!submitted) return json({error:'Invalid tracking IDs. Only public vendor identifiers are accepted.'},400);
        const stored=await env.DB.prepare("INSERT INTO store_settings (key,data_json) VALUES ('tracking-config',?) ON CONFLICT(key) DO UPDATE SET data_json=excluded.data_json,updated_at=CURRENT_TIMESTAMP")
          .bind(JSON.stringify(submitted)).run();
        return stored.success?json({success:true,config:submitted}):json({error:'D1 did not confirm settings update'},503);
      }
      if (path === '/api/categories' && method === 'GET') {
        const categories=await categoryList(env.DB);
        return json(categories);
      }
      if (path === '/api/admin/categories' && method === 'GET') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        return json(await categoryList(env.DB,true));
      }
      if (path === '/api/admin/categories' && method === 'POST') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        const payload=await readBody(request);
        const category=parseCategoryPayload(payload);
        if(!category) return json({error:'Catégorie invalide: nom, ID et image HTTPS requis'},400);
        const all=await categoryList(env.DB,true);
        if(all.some(cat=>cat.id===category.id)) return json({error:'Identifiant de catégorie déjà utilisé'},409);
        const saved=await env.DB.prepare('INSERT INTO category_overrides (id,data_json,active) VALUES (?,?,?)')
          .bind(category.id,JSON.stringify(category),category.isActive?1:0).run();
        return saved.success ? json({success:true,category},201) : json({error:'Enregistrement non confirmé'},503);
      }
      const categoryMatch=path.match(/^\/api\/admin\/categories\/([a-z0-9_-]+)$/);
      if (categoryMatch && method === 'PUT') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        const id=categoryMatch[1];
        const all=await categoryList(env.DB,true);
        const existing=all.find(cat=>cat.id===id);
        if(!existing) return json({error:'Catégorie introuvable'},404);
        const payload=await readBody(request);
        if (payload?.id!==id) return json({error:'Identifiant de catégorie immuable'},400);
        const category=parseCategoryPayload(payload,existing);
        if(!category) return json({error:'Données de catégorie invalides'},400);
        // Do not hide an existing category with published products.
        if(!category.isActive && existing.isActive) {
          const activeProducts=await listProducts(env.DB,false,env.STORE_DEMO_CATALOG==='true');
          if(activeProducts.some((p:any)=>p.category===id))
            return json({error:'Cette catégorie contient des produits publiés. Déplacez-les avant de la désactiver.'},409);
        }
        const saved=await env.DB.prepare('INSERT INTO category_overrides (id,data_json,active) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json,active=excluded.active,updated_at=CURRENT_TIMESTAMP')
          .bind(id,JSON.stringify(category),category.isActive?1:0).run();
        return saved.success ? json({success:true,category}) : json({error:'Mise à jour non confirmée'},503);
      }
      if (path === '/api/products' && method === 'GET') return json(await listProducts(env.DB, false, env.STORE_DEMO_CATALOG === 'true'));
      if (path === '/api/admin/products' && method === 'GET') {
        if (!await auth(request, env)) return json({ error: 'Unauthorized' }, 401);
        return json(await listProducts(env.DB, true, env.STORE_DEMO_CATALOG === 'true'));
      }
      // Public self-service tracking requires two independent order identifiers.
      // Never expose raw order JSON, address, telephone, name or full order listings.
      // Requests are rate-limited (at the top of fetch) using an IP-scoped Worker limiter.
      if (path === '/api/track-order' && method === 'POST') {
        const body = await readBody(request);
        const reference = typeof body?.reference === 'string' ? body.reference.trim().toUpperCase() : '';
        const rawPhone = typeof body?.phone === 'string' ? body.phone.trim() : '';
        if (!/^GB-[A-Z0-9-]{6,36}$/.test(reference) || rawPhone.length > 32)
          return json({error:'Invalid order reference or phone number'},400);
        const normalisePhone = (value:string) => {
          const digits=value.replace(/[^0-9]/g,'');
          if(digits.startsWith('00212')) return digits.slice(5);
          if(digits.startsWith('212')) return digits.slice(3);
          return digits.startsWith('0') ? digits.slice(1) : digits;
        };
        const phone = normalisePhone(rawPhone);
        if(!/^[5-7][0-9]{8}$/.test(phone)) return json({error:'Invalid order reference or phone number'},400);
        const row=await env.DB.prepare("SELECT data_json FROM orders WHERE UPPER(json_extract(data_json, '$.reference')) = ? LIMIT 1")
          .bind(reference).first<{data_json:string}>();
        const order = row ? JSON.parse(row.data_json) : null;
        // The same response is used for both an unknown reference and a phone mismatch.
        if(!order || normalisePhone(String(order.phoneNumber || ''))!==phone)
          return json({error:'Order not found. Verify your reference and telephone.'},404);
        const status = ['pending','confirmed','processing','shipped','delivered','cancelled'].includes(order.status)
          ? order.status : 'pending';
        return json({success:true,tracking:{
          reference, status,
          date:typeof order.date==='string' ? order.date : null,
          total:Number.isFinite(order.total) ? order.total : null,
          itemCount:Array.isArray(order.items)
            ? order.items.reduce((sum:number,item:any)=>sum+(Number.isFinite(item.quantity)?item.quantity:0),0)
            : 0,
          source:'store',
          courierTrackingAvailable: Boolean(order.shipping?.carrier && order.shipping?.trackingNumber),
          ...(order.shipping?.carrier && order.shipping?.trackingNumber
            ? {carrier:String(order.shipping.carrier).slice(0,100),trackingNumber:String(order.shipping.trackingNumber).slice(0,100)}
            : {})
        }});
      }
      if (path === '/api/orders' && method === 'GET') {
        if (!await auth(request, env)) return json({ error: 'Unauthorized' }, 401);
        const rows = await env.DB.prepare('SELECT data_json FROM orders ORDER BY created_at DESC').all<{ data_json: string }>();
        return json(rows.results.map(row => JSON.parse(row.data_json)));
      }
      if (path === '/api/orders' && method === 'POST') {
        // Fail closed until the operator verifies real products, fulfillment
        // and the administrative account. A successful build is not a launch.
        if (env.STORE_ACCEPTING_ORDERS !== 'true')
          return json({error:'La boutique n’accepte pas encore de commandes. Veuillez revenir bientôt.'},503);
        const requestBody = await readBody(request);
        const catalog = await listProducts(env.DB, false, env.STORE_DEMO_CATALOG === 'true');
        const quote = quoteOrder(requestBody, catalog);
        if ('error' in quote) return json({ error: quote.error }, quote.status);
        const record = await persistValidatedOrder(env.DB,quote);
        return json({ success: true, order: record }, 201);
      }
      const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
      if (orderMatch && ['PUT','DELETE'].includes(method)) {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        const id = decodeURIComponent(orderMatch[1]);
        let resolvedId = id;
        let existing = await env.DB.prepare('SELECT data_json FROM orders WHERE id=?').bind(id).first<{data_json:string}>();
        if (!existing) {
          const all = await env.DB.prepare('SELECT id, data_json FROM orders').all<{id:string,data_json:string}>();
          const match = all.results.find(entry => {
            const order = JSON.parse(entry.data_json);
            return order.reference === id || order.orderId === id;
          });
          if (match) { resolvedId = match.id; existing = {data_json:match.data_json}; }
        }
        if (!existing) return json({error:'Order not found'},404);
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM orders WHERE id=?').bind(resolvedId).run();
          return json({success:true});
        }
        const update = await readBody(request);
        const allowed = ['pending','confirmed','processing','shipped','delivered','cancelled'];
        if (!update || typeof update!=='object' || Array.isArray(update)) return json({error:'Invalid order update'},400);
        if (update.status!==undefined && !allowed.includes(update.status)) return json({error:'Invalid order status'},400);
        if (update.status===undefined && update.shipping===undefined) return json({error:'Nothing to update'},400);
        const oldOrder=JSON.parse(existing.data_json);
        const status=update.status===undefined ? oldOrder.status : update.status;
        const nextShipping={...oldOrder.shipping};
        if(update.shipping!==undefined){
          if(!update.shipping || typeof update.shipping!=='object' || Array.isArray(update.shipping))
            return json({error:'Invalid shipping data'},400);
          const shipping=update.shipping as Record<string,unknown>;
          const allowedKeys=new Set(['carrier','trackingNumber','internalNote']);
          if(Object.keys(shipping).some(key=>!allowedKeys.has(key)))return json({error:'Unexpected shipping field'},400);
          const allowedText=(value:unknown,max:number)=>typeof value==='string' && value.trim().length<=max && !/[<>\r\n]/.test(value);
          if(!Object.entries(shipping).every(([key,value])=>allowedText(value,key==='internalNote'?500:100)))
            return json({error:'Invalid shipping text'},400);
          if(shipping.trackingNumber!==undefined && shipping.trackingNumber && !/^[A-Za-z0-9][A-Za-z0-9 ._\/-]{0,99}$/.test(String(shipping.trackingNumber)))
            return json({error:'Invalid tracking reference'},400);
          for(const [key,value] of Object.entries(shipping))nextShipping[key]=String(value).trim();
          nextShipping.updatedAt=new Date().toISOString();
        }
        const order={...oldOrder,status,
          ...(update.shipping===undefined?{}:{shipping:nextShipping}),
          updatedAt:new Date().toISOString()};
        const write=await env.DB.prepare('UPDATE orders SET status=?,data_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
          .bind(status,JSON.stringify(order),resolvedId).run();
        if(!write.success || write.meta?.changes!==1)return json({error:'D1 did not confirm update'},503);
        return json({success:true,order});
      }
      if (path === '/api/orders-clear' && method === 'DELETE') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        return json({error:'Bulk deletion disabled for safety'},403);
      }
      if (path === '/api/import-products' && method === 'POST') {
        if (!await importAuthorized(request,env)) return json({error:'Unauthorized'},401);
        const body = await readBody(request);
        if (!Array.isArray(body?.products) || !body.products.length || body.products.length>50)
          return json({error:'Expected 1-50 products'},400);
        const created:string[]=[],skipped:string[]=[],rejected:number[]=[];
        for (const [index,p] of body.products.entries()) {
          let source:URL,img:URL;
          try { source=new URL(p.sourceUrl); img=new URL(p.image); } catch { rejected.push(index);continue; }
          if (source.protocol!=='https:' || !['atwache.ma','www.atwache.ma'].includes(source.hostname) ||
              img.protocol!=='https:' || typeof p.name?.fr!=='string' || !p.name.fr.trim() ||
              typeof p.price!=='number' || !Number.isFinite(p.price) || p.price<=0) { rejected.push(index);continue; }
          const id='atwache_'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source.href))))
            .slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');
          const row={id,sourceUrl:source.href,supplier:'Atwache',name:{fr:p.name.fr,ar:p.name.ar||p.name.fr,en:p.name.en||p.name.fr},
            description:{fr:p.description?.fr||'',ar:p.description?.ar||'',en:p.description?.en||''},
            price:p.price,image:img.href,images:[img.href],category:String(p.category||'camping'),
            features:{fr:[],ar:[],en:[]},inStock:true,isActive:false,rating:0,reviewsCount:0};
          const result=await env.DB.prepare('INSERT OR IGNORE INTO products (id,source_url,supplier,category,name_fr,price_mad,image_url,active,data_json) VALUES (?,?,?,?,?,?,?,?,?)')
            .bind(id,source.href,'Atwache',row.category,p.name.fr,p.price,img.href,0,JSON.stringify(row)).run();
          if (result.meta.changes) created.push(id); else skipped.push(id);
        }
        await env.DB.prepare('INSERT INTO import_log (source,imported_count,skipped_count) VALUES (?,?,?)')
          .bind('Atwache',created.length,skipped.length).run();
        return json({status:'draft',created,skipped,rejected});
      }
      const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
      if ((path === '/api/products' && method === 'POST') || (productMatch && ['PUT','DELETE'].includes(method))) {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        const payload = method === 'DELETE' ? null : await readBody(request);
        const id = productMatch?.[1] || (typeof payload?.id === 'string' ? payload.id.trim() : '');
        if (!id || id.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(id)) return json({error:'Invalid product ID'},400);
        if (method === 'DELETE') {
          // Keep a disabled row rather than deleting it: a hard delete would
          // reveal a bundled fallback product with the same ID again.
          const stored = await env.DB.prepare('SELECT data_json FROM products WHERE id=?')
            .bind(id).first<{data_json:string}>();
          const oldProduct = stored ? JSON.parse(stored.data_json) : PRODUCTS.find(p => p.id === id);
          if (!oldProduct) return json({error:'Product not found'},404);
          const hidden = {...oldProduct,id,isActive:false};
          if (stored) {
            await env.DB.prepare('UPDATE products SET active=0,data_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
              .bind(JSON.stringify(hidden),id).run();
          } else {
            await env.DB.prepare('INSERT INTO products (id,source_url,supplier,category,name_fr,price_mad,image_url,active,data_json) VALUES (?,?,?,?,?,?,?,?,?)')
              .bind(id,null,null,oldProduct.category || '',oldProduct.name?.fr || id,
                oldProduct.price,oldProduct.image || '',0,JSON.stringify(hidden)).run();
          }
          return json({success:true,product:hidden});
        }
        const p = payload;
        if (!p || typeof p.name?.fr !== 'string' || !Number.isFinite(p.price) || p.price <= 0) return json({error:'Invalid product'},400);
        if (method === 'POST') {
          const already = await env.DB.prepare('SELECT id FROM products WHERE id=?').bind(id).first();
          if (already) return json({error:'Product ID already exists'},409);
        }
        // Preserve the stored visibility on edits, unless the caller explicitly supplies a boolean.
        const previous = method === 'PUT'
          ? await env.DB.prepare('SELECT active FROM products WHERE id=?').bind(id).first<{active:number}>()
          : null;
        // On updates, changing visibility requires an explicit opt-in, not merely
        // an isActive field in a stale product form. Prevent accidental publishing.
        // New products always enter Draft, even if a stale or forged admin form
        // submits isActive=true. Publishing is a deliberate separate PUT action.
        const active = method === 'PUT' && previous
          ? (p.visibilityChanged === true && typeof p.isActive === 'boolean'
            ? p.isActive : previous.active === 1)
          : false;
        // Provisional sourced products must not be offered for sale unless their
        // media and supply checks have been explicitly completed by the merchant.
        // Existing ordinary products and historical orders are unaffected.
        if(active && id.startsWith('gb_source_')) {
          const gallery=[p.image,...(Array.isArray(p.images)?p.images:[]),...(Array.isArray(p.additionalImages)?p.additionalImages:[])]
            .filter((value:unknown)=>typeof value==='string' && /^https:\/\//.test(value as string));
          if(p.needsSupplierVerification===true || p.imageRightsConfirmed!==true ||
             p.readyToPublish!==true || new Set(gallery).size<6 || p.inStock!==true) {
            return json({error:'Publish blocked: verify stock, supplier, image rights and six distinct product photos.'},422);
          }
        }
        const row = { ...p, id, isActive: active };
        await env.DB.prepare('INSERT INTO products (id,source_url,supplier,category,name_fr,price_mad,image_url,active,data_json) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET category=excluded.category,name_fr=excluded.name_fr,price_mad=excluded.price_mad,image_url=excluded.image_url,active=excluded.active,data_json=excluded.data_json,updated_at=CURRENT_TIMESTAMP')
          .bind(id,p.sourceUrl || null,p.supplier || null,p.category || '',p.name.fr,p.price,p.image || '',row.isActive ? 1 : 0,JSON.stringify(row)).run();
        return json({success:true,product:row});
      }
      return json({error:'Not found'},404);
    } catch (err) {
      console.error('GLOBABOX Worker API error', err);
      return json({error:'Internal server error'},500);
    }
  }
} satisfies ExportedHandler<Env>;
