import { PRODUCTS, CATEGORIES } from '../src/data';
import { STORE_DEPARTMENTS } from '../src/storefrontDepartments';
import { DEFAULT_TRACKING_CONFIG, validateTrackingConfig } from '../src/trackingConfig';
import { isAdmin, handleAdminAuth } from './auth';
import { quoteOrder } from './orderQuote';

interface Env { ADMIN_RATE_LIMITER?: {limit: (options:{key:string}) => Promise<{success:boolean}>}; CHECKOUT_RATE_LIMITER?: {limit: (options:{key:string}) => Promise<{success:boolean}>}; DB: D1Database; ASSETS: Fetcher; ADMIN_USERNAME?: string; ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string; ADMIN_API_KEY?: string; STORE_ACCEPTING_ORDERS?: string; STORE_DEMO_CATALOG?: string; AMEEX_API_ID?: string; AMEEX_API_KEY_TEST?: string; OPENAI_API_KEY?: string; AI?: Ai }
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


const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch] as string));
function landingPageHtml(page:any, product:any) {
  const content=page.content||{}, ar=content.ar||{};
  const rawDesign=content.design||{};
  const safeColor=(v:any,f:string)=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)?v:f;
  const design={layout:['split-editorial','centered-product','bold-commerce'].includes(rawDesign.layout)?rawDesign.layout:'split-editorial',primary:safeColor(rawDesign.primary,'#104d43'),accent:safeColor(rawDesign.accent,'#d69b43'),background:safeColor(rawDesign.background,'#f6f8f7'),surface:safeColor(rawDesign.surface,'#ffffff'),text:safeColor(rawDesign.text,'#172b27'),heroStyle:['contained','cover'].includes(rawDesign.heroStyle)?rawDesign.heroStyle:'contained'};
  const gallery=Array.isArray(content._gallery)?content._gallery.filter((x:any)=>typeof x==='string').slice(0,10):[page.image_url];
  const galleryHtml=gallery.filter((url:string)=>url!==page.image_url).map((url:string,i:number)=>'<img loading="lazy" src="'+escapeHtml(url)+'" alt="'+escapeHtml(page.title)+' · '+(i+2)+'" class="gallery-image">').join('');
  const data=JSON.stringify({content,title:page.title,price:Number(product.price)})
    .replace(/</g,'\\u003c').replace(/\\u2028/g,'\\u2028').replace(/\\u2029/g,'\\u2029');
  const benefits=(ar.benefits||[]).slice(0,6).map((x:string)=>'<li>'+escapeHtml(x)+'</li>').join('');
  const faqHtml=(ar.faq||[]).slice(0,5).map((x:any)=>'<article class="faq-item"><h3>'+escapeHtml(x.question)+'</h3><p>'+escapeHtml(x.answer)+'</p></article>').join('');
  return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+escapeHtml(ar.subheadline||ar.description||page.title)+'"><title>'+escapeHtml(page.title)+' | GLOBABOX</title><style>'+
  ':root{--brand:'+design.primary+';--accent:'+design.accent+';--page-bg:'+design.background+';--surface:'+design.surface+';--ink:'+design.text+'}*{box-sizing:border-box}body{margin:0;background:var(--page-bg);color:var(--ink);font-family:Arial,Tahoma,sans-serif}.wrap{max-width:1120px;margin:auto;padding:clamp(14px,3vw,32px)}.brand{font-weight:900;letter-spacing:.12em;color:var(--brand);padding:12px 0}.langs{display:flex;gap:8px;flex-wrap:wrap}.langs button{border:1px solid #dce6e0;background:var(--surface);padding:9px 14px;border-radius:10px}.hero,.section{background:var(--surface);border:1px solid #e5ece8;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px #1232;margin-top:16px}.hero img{width:100%;max-height:460px;object-fit:'+design.heroStyle+';background:var(--page-bg)}.body{padding:clamp(20px,5vw,48px)}h1{font-size:clamp(28px,5vw,52px);line-height:1.12;margin:12px 0}p{line-height:1.9;color:color-mix(in srgb,var(--ink) 72%,white)}.price{font-size:30px;font-weight:900;color:var(--brand);margin:20px 0}.btn{display:block;width:100%;border:0;border-radius:14px;background:var(--brand);color:white;padding:16px;font-size:17px;font-weight:800;text-align:center;text-decoration:none;cursor:pointer}.section{padding:24px}.form{display:grid;gap:12px}.form input:not([type=checkbox]){width:100%;padding:14px;border:1px solid #dbe5df;border-radius:12px;font-size:16px}.consent{display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.7;color:#52645d}.consent input{margin-top:4px;accent-color:var(--brand)}.msg{padding:14px;border-radius:12px;background:color-mix(in srgb,var(--brand) 9%,white);margin-top:12px}.foot{text-align:center;color:#71817a;padding:28px;font-size:12px}.hero.layout-centered-product{text-align:center}.hero.layout-centered-product .body{max-width:760px;margin:auto}.hero.layout-centered-product img{max-height:520px}.hero.layout-bold-commerce{border-radius:8px;border:0;box-shadow:none}.hero.layout-bold-commerce .body{background:var(--brand);color:white}.hero.layout-bold-commerce .body p,.hero.layout-bold-commerce .price{color:white}.hero.layout-bold-commerce .btn{background:var(--accent);color:#171717}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:16px}.gallery-image{width:100%;height:190px;object-fit:contain;background:var(--surface);border-radius:16px;padding:8px}@media(min-width:700px){.hero{display:grid;grid-template-columns:1fr 1fr;align-items:center}.hero img{height:100%;max-height:620px}.body{padding:42px}.hero.layout-centered-product{display:block}.hero.layout-bold-commerce{grid-template-columns:1.1fr .9fr}}</style></head><body><main class="wrap"><div class="brand">GLOBABOX</div><div class="langs"><button type="button" data-lang="ar">العربية</button><button type="button" data-lang="fr">Français</button><button type="button" data-lang="en">English</button></div>'+
  '<article class="hero layout-'+design.layout+'"><img src="'+escapeHtml(page.image_url)+'" alt="'+escapeHtml(page.title)+'"><div class="body"><p>GLOBABOX · الدفع عند الاستلام</p><h1 id="headline">'+escapeHtml(ar.headline||page.title)+'</h1><p id="subheadline">'+escapeHtml(ar.subheadline||'')+'</p><div class="price">'+escapeHtml(product.price)+' DH</div><p id="description">'+escapeHtml(ar.description||'')+'</p><ul id="benefits">'+benefits+'</ul><a class="btn" href="#order" id="cta">'+escapeHtml(ar.cta||'اطلب الآن')+'</a></div></article>'+
  '<section class="gallery" aria-label="Product photo gallery">'+galleryHtml+'</section><section class="section" id="faq"><h2 id="faqTitle">أسئلة شائعة</h2><div id="faqList">'+faqHtml+'</div></section><section class="section"><h2 id="orderTitle">اطلب الآن والدفع عند الاستلام</h2><p id="privacyIntro">المعلومات مطلوبة فقط لتأكيد الطلب وتوصيله، ولن تظهر للزوار الآخرين.</p><form id="order" class="form"><input name="fullName" required minlength="3" maxlength="120" autocomplete="name" placeholder="الاسم الكامل"><input name="phoneNumber" required type="tel" inputmode="tel" maxlength="32" autocomplete="tel" placeholder="رقم الهاتف"><input name="city" required maxlength="100" autocomplete="address-level2" placeholder="المدينة"><input name="deliveryAddress" required minlength="5" maxlength="300" autocomplete="street-address" placeholder="العنوان بالتفصيل"><input name="notes" maxlength="500" placeholder="ملاحظة (اختياري)"><label class="consent"><input type="checkbox" name="privacyConsent" value="true" required><span id="privacyConsentLabel">أوافق على استعمال معلوماتي الشخصية لمعالجة الطلب والتواصل معي بخصوص التوصيل وفق سياسة الخصوصية.</span></label><button class="btn" type="submit" id="submit">تأكيد الطلب</button></form><div id="message" class="msg" hidden></div></section><div class="foot">GLOBABOX · Maroc</div></main><script>'+
  'const page='+data+';let lang="ar";const $=id=>document.getElementById(id);function showLanguage(next){lang=next;const c=page.content[next]||page.content.ar||{};document.documentElement.lang=next;document.documentElement.dir=next==="ar"?"rtl":"ltr";$("headline").textContent=c.headline||page.title;$("subheadline").textContent=c.subheadline||"";$("description").textContent=c.description||"";$("cta").textContent=c.cta||({ar:"اطلب الآن",fr:"Commander maintenant",en:"Order now"}[next]);$("benefits").replaceChildren(...(c.benefits||[]).map(x=>{const li=document.createElement("li");li.textContent=x;return li;}));$("faqTitle").textContent=({ar:"أسئلة شائعة",fr:"Questions fréquentes",en:"Frequently asked questions"}[next]);$("faqList").replaceChildren(...(c.faq||[]).map(x=>{const article=document.createElement("article");article.className="faq-item";const h=document.createElement("h3");h.textContent=x.question;const p=document.createElement("p");p.textContent=x.answer;article.append(h,p);return article;}));$("orderTitle").textContent=({ar:"اطلب الآن والدفع عند الاستلام",fr:"Commander · Paiement à la livraison",en:"Order now · Cash on delivery"}[next]);$("submit").textContent=({ar:"تأكيد الطلب",fr:"Confirmer la commande",en:"Place order"}[next]);$("privacyIntro").textContent=({ar:"المعلومات مطلوبة فقط لتأكيد الطلب وتوصيله، ولن تظهر للزوار الآخرين.",fr:"Vos informations servent uniquement à traiter et livrer la commande. Elles ne sont pas visibles par les autres visiteurs.",en:"Your details are used only to process and deliver your order. They are not visible to other visitors."}[next]);$("privacyConsentLabel").textContent=({ar:"أوافق على استعمال معلوماتي الشخصية لمعالجة الطلب والتواصل معي بخصوص التوصيل وفق سياسة الخصوصية.",fr:"J’accepte l’utilisation de mes informations pour traiter la commande et me contacter au sujet de la livraison, conformément à la politique de confidentialité.",en:"I agree to the use of my personal information to process this order and contact me about delivery, in accordance with the privacy policy."}[next]);const placeholders={ar:["الاسم الكامل","رقم الهاتف","المدينة","العنوان بالتفصيل","ملاحظة (اختياري)"],fr:["Nom complet","Téléphone","Ville","Adresse de livraison","Note (facultatif)"],en:["Full name","Phone number","City","Delivery address","Note (optional)"]}[next];["fullName","phoneNumber","city","deliveryAddress","notes"].forEach((name,i)=>$("order").elements[name].placeholder=placeholders[i]);}document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>showLanguage(b.dataset.lang)));'+
  '$("order").addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form).entries());data.privacyConsent=data.privacyConsent==="true";const button=$("submit");button.disabled=true;button.textContent="…";$("message").hidden=true;try{const response=await fetch("/api/landing-pages/"+encodeURIComponent(location.pathname.split("/").pop())+"/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw new Error(result.error||"تعذر تسجيل الطلب");$("message").textContent=({ar:"تم تسجيل طلبك. رقم الطلب: ",fr:"Commande enregistrée. Référence : ",en:"Order received. Reference: "}[lang])+result.order.reference;$("message").hidden=false;form.reset();}catch(err){$("message").textContent=err.message||"حدث خطأ، حاول مرة أخرى";$("message").hidden=false;}finally{button.disabled=false;button.textContent=({ar:"تأكيد الطلب",fr:"Confirmer la commande",en:"Place order"}[lang]);}});'+
  '</script></body></html>';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (!path.startsWith('/api/')) {
      const match=path.match(/^\/lp\/([a-z0-9-]{1,80})$/);
      if(!match)return env.ASSETS.fetch(request);
      if(method!=='GET')return new Response('Method not allowed',{status:405,headers:{Allow:'GET'}});
      try{
        const row=await env.DB.prepare("SELECT id,slug,title,product_id,image_url,content_json,status FROM landing_pages WHERE slug=? AND status='published' LIMIT 1").bind(match[1]).first<any>();
        if(!row||!row.product_id)return new Response('Page not found',{status:404});
        const stored=await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(row.product_id).first<{data_json:string;active:number}>();
        if(!stored||stored.active!==1)return new Response('Page not found',{status:404});
        const product=JSON.parse(stored.data_json);
        if(product.isActive===false||product.inStock!==true||product.stockStatus==='out_of_stock'||!Number.isFinite(product.price)||product.price<=0)return new Response('Product unavailable',{status:410});
        return new Response(landingPageHtml({...row,content:JSON.parse(row.content_json)},product),{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'public, max-age=60'}});
      }catch(error){console.error('[GLOBABOX] Public landing page render failed',error);return new Response('Page temporarily unavailable',{status:503});}
    }
    const reviewSubmission = method === 'POST' && path.startsWith('/api/products/') && path.endsWith('/reviews') && path.split('/').length === 5;
    if (method === 'POST' && (path === '/api/admin/login' || path === '/api/orders' || path === '/api/track-order' || (path.startsWith('/api/landing-pages/') && path.endsWith('/order')) || reviewSubmission)) {
      const limiter = path === '/api/admin/login' ? env.ADMIN_RATE_LIMITER : env.CHECKOUT_RATE_LIMITER;
      // Fail closed for public write endpoints when the anti-abuse binding is missing.
      if (!limiter) return json({error:'Service temporarily unavailable'},503);
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const key = path === '/api/track-order' ? 'tracking:' + ip : reviewSubmission ? 'review:' + ip : path.startsWith('/api/landing-pages/') ? 'landing-order:' + ip : ip;
      const result = await limiter.limit({key});
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
      // AI Landing Pages: authenticated draft creation and editing only.
      if (path === '/api/admin/landing-pages' && method === 'GET') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        const rows = await env.DB.prepare('SELECT id,slug,title,product_id,image_url,price_mad,compare_at_price_mad,content_json,status,created_at,updated_at FROM landing_pages ORDER BY updated_at DESC').all<any>();
        const pages = (rows.results || []).map((row:any) => {const stored=JSON.parse(row.content_json);const images=Array.isArray(stored._gallery)?stored._gallery:[row.image_url];const priceConfirmed=stored._priceConfirmed===true,comparePriceConfirmed=stored._comparePriceConfirmed===true;delete stored._gallery;delete stored._priceConfirmed;delete stored._comparePriceConfirmed;return {id:row.id,slug:row.slug,title:row.title,productId:row.product_id||null,imageUrl:row.image_url,images,price:row.price_mad,compareAtPrice:row.compare_at_price_mad,priceConfirmed,comparePriceConfirmed,content:stored,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at};});
        return json({pages});
      }
      if (path === '/api/admin/landing-pages/draft' && method === 'POST') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        const body=await readBody(request), mediaId=typeof body?.mediaId==='string'?body.mediaId:'';
        const mediaIds=Array.isArray(body?.mediaIds)?Array.from(new Set(body.mediaIds.filter((x:unknown)=>typeof x==='string'&&/^[a-f0-9-]{36}$/i.test(x as string)))).slice(0,10) as string[]:[mediaId];
        const productName=typeof body?.productName==='string'?body.productName.trim().slice(0,120):'';
        const sellingPrice=body?.sellingPrice==null?null:Number(body.sellingPrice), compareAtPrice=body?.compareAtPrice==null?null:Number(body.compareAtPrice);
        if (!/^[a-f0-9-]{36}$/i.test(mediaId)||!mediaIds.length||mediaIds[0]!==mediaId) return json({error:'Upload between 1 and 10 valid product photos.'},400);
        if (sellingPrice!==null&&(!Number.isFinite(sellingPrice)||sellingPrice<=0||sellingPrice>1000000)) return json({error:'Invalid selling price.'},400);
        if (compareAtPrice!==null&&(!Number.isFinite(compareAtPrice)||compareAtPrice<=0||compareAtPrice>1000000)) return json({error:'Invalid comparison price.'},400);
        if (sellingPrice!==null&&compareAtPrice!==null&&compareAtPrice<=sellingPrice) return json({error:'Comparison price must be higher than selling price.'},400);
        const galleryRows=await Promise.all(mediaIds.map((id:string)=>env.DB.prepare('SELECT content_type FROM product_media WHERE id=?').bind(id).first<{content_type:string}>()));
        if(galleryRows.some((m:any)=>!m||!['image/jpeg','image/png','image/webp'].includes(m.content_type)))return json({error:'One or more product photos are missing or invalid. Upload them again.'},404);
        const images=mediaIds.map((id:string)=>new URL('/api/product-media/'+id,request.url).href);
        const title=productName||'Produit GLOBABOX';
        const slugBase=title.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,54)||'produit';
        const slug=slugBase+'-'+crypto.randomUUID().slice(0,6);
        const id=crypto.randomUUID(),imageUrl=new URL('/api/product-media/'+mediaId,request.url).href;
        const content:any={_gallery:images,
          ar:{headline:'اكتشف '+title,subheadline:'تعرّف على المنتج من خلال الصور والمعلومات المتوفرة.',description:'هذه صفحة تعريفية بالمنتج. أضف التفاصيل المؤكدة قبل نشرها.',benefits:[],limitations:['يرجى تأكيد خصائص المنتج ومحتوياته قبل النشر.'],faq:[],cta:'اطلب الآن'},
          fr:{headline:'Découvrez '+title,subheadline:'Consultez les photos et les informations disponibles sur ce produit.',description:'Cette page présente le produit. Ajoutez les détails vérifiés avant publication.',benefits:[],limitations:['Veuillez vérifier les caractéristiques et le contenu du produit avant publication.'],faq:[],cta:'Commander maintenant'},
          en:{headline:'Discover '+title,subheadline:'Explore the product photos and the information provided.',description:'This page introduces the product. Add verified details before publishing.',benefits:[],limitations:['Please verify product specifications and package contents before publishing.'],faq:[],cta:'Order now'}
        };
        const written=await env.DB.prepare('INSERT INTO landing_pages (id,slug,title,image_url,media_id,price_mad,compare_at_price_mad,content_json,status) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,slug,title,imageUrl,mediaId,sellingPrice,compareAtPrice,JSON.stringify(content),'draft').run();
        if(!written.success||written.meta?.changes!==1)return json({error:'Draft could not be saved to the database.'},503);
        console.info('[GLOBABOX] Template landing page draft created',id);
        return json({page:{id,slug,title,imageUrl,images,price:sellingPrice,compareAtPrice,content,status:'draft',productId:null}},201);
      }
      if (path === '/api/admin/landing-pages/generate' && method === 'POST') {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        if (!env.OPENAI_API_KEY && !env.AI) return json({error:'AI is not configured. Add OPENAI_API_KEY as a Cloudflare secret or bind Workers AI.'},503);
        const body=await readBody(request), mediaId=typeof body?.mediaId==='string'?body.mediaId:'';
        const mediaIds=Array.isArray(body?.mediaIds)?Array.from(new Set(body.mediaIds.filter((x:unknown)=>typeof x==='string'&&/^[a-f0-9-]{36}$/i.test(x as string)))).slice(0,10) as string[]:[mediaId];
        const productName=typeof body?.productName==='string'?body.productName.trim().slice(0,120):'';
        const sellingPrice=body?.sellingPrice==null?null:Number(body.sellingPrice), compareAtPrice=body?.compareAtPrice==null?null:Number(body.compareAtPrice);
        if (!/^[a-f0-9-]{36}$/i.test(mediaId)||!mediaIds.length||mediaIds[0]!==mediaId) return json({error:'Upload between 1 and 10 valid product photos.'},400);
        if (sellingPrice!==null&&(!Number.isFinite(sellingPrice)||sellingPrice<=0||sellingPrice>1000000)) return json({error:'Invalid selling price.'},400);
        if (compareAtPrice!==null&&(!Number.isFinite(compareAtPrice)||compareAtPrice<=0||compareAtPrice>1000000)) return json({error:'Invalid comparison price.'},400);
        if (sellingPrice!==null&&compareAtPrice!==null&&compareAtPrice<=sellingPrice) return json({error:'Comparison price must be higher than selling price.'},400);
        const galleryRows=await Promise.all(mediaIds.map((id:string)=>env.DB.prepare('SELECT content_type FROM product_media WHERE id=?').bind(id).first<{content_type:string}>()));
        if(galleryRows.some((m:any)=>!m||!['image/jpeg','image/png','image/webp'].includes(m.content_type)))return json({error:'One or more product photos are missing or invalid. Upload them again.'},404);
        const images=mediaIds.map((id:string)=>new URL('/api/product-media/'+id,request.url).href);
        const media=await env.DB.prepare('SELECT content_type,body FROM product_media WHERE id=?').bind(mediaId).first<{content_type:string;body:Uint8Array}>();
        if (!media||!media.body||!['image/jpeg','image/png','image/webp'].includes(media.content_type)) return json({error:'Product image not found. Upload it again.'},404);
        const bytes=media.body instanceof Uint8Array?media.body:new Uint8Array(media.body as any);
        if (!bytes.length||bytes.length>750000) return json({error:'Image exceeds the allowed size.'},413);
        let binary=''; for(let i=0;i<bytes.length;i+=0x8000) binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
        const imageData='data:'+media.content_type+';base64,'+btoa(binary);
        const prompt=[
          'You are GLOBABOX AI, a senior Moroccan ecommerce creative director and conversion copywriter.',
          'Study the attached product image and create a polished, premium, brand-consistent sales page brief for a modern Moroccan online store.',
          'Write natural Modern Standard Arabic suitable for Moroccan shoppers, polished French, and clear English.',
          'Product name supplied by merchant: '+(productName||'Not supplied; identify only what is clearly visible in the photo.'),
          'Selling price in MAD: '+(sellingPrice===null?'Not supplied; return null and never invent a price.':String(sellingPrice)),
          'Comparison price in MAD: '+(compareAtPrice===null?'Not supplied; return null and never invent a price.':String(compareAtPrice)),
          'Never invent product specifications, materials, dimensions, compatibility, certifications, medical benefits, warranties, reviews, testimonials, delivery times, scarcity or discounts.',
          'Do not claim a feature unless it is explicitly supplied by the merchant or unmistakably visible. Separate safe visual observations from facts requiring merchant verification.',
          'Create a strong but honest headline, concise subheadline, persuasive product story, 3-5 cautious benefits/use cases, 3 useful FAQs, a clear call to action, and a short visual art direction for a premium product page.',
          'Return ONLY valid JSON with this exact shape: {"title":"short product title","slug":"latin-url-slug","content":{"ar":{"headline":"","subheadline":"","description":"","benefits":[""],"limitations":[""],"faq":[{"question":"","answer":""}],"cta":"اطلب الآن","visualDirection":""},"fr":{"headline":"","subheadline":"","description":"","benefits":[""],"limitations":[""],"faq":[{"question":"","answer":""}],"cta":"Commander maintenant","visualDirection":""},"en":{"headline":"","subheadline":"","description":"","benefits":[""],"limitations":[""],"faq":[{"question":"","answer":""}],"cta":"Order now","visualDirection":""}}}.',
          'Use 3-5 concise benefits and 3 FAQs per language. Prices are controlled by merchant input. No markdown fences or extra text.'
        ].join('\n');
        let generated:any;
        try {
          if (env.OPENAI_API_KEY) {
            // OpenAI vision + Structured Outputs: schema-constrained JSON prevents
            // malformed model responses from breaking the landing-page workflow.
            const schema = {
              type: 'object', additionalProperties: false,
              required: ['title','slug','content','design'],
              properties: {
                title: {type:'string'},
                slug: {type:'string'},
                design:{type:'object',additionalProperties:false,required:['layout','primary','accent','background','surface','text','heroStyle'],properties:{layout:{type:'string',enum:['split-editorial','centered-product','bold-commerce']},primary:{type:'string'},accent:{type:'string'},background:{type:'string'},surface:{type:'string'},text:{type:'string'},heroStyle:{type:'string',enum:['contained','cover']}}},
                content: {
                  type:'object', additionalProperties:false, required:['ar','fr','en'],
                  properties: Object.fromEntries(['ar','fr','en'].map((lang:string)=>[lang,{
                    type:'object',additionalProperties:false,
                    required:['headline','subheadline','description','benefits','limitations','faq','cta','visualDirection'],
                    properties:{
                      headline:{type:'string'},subheadline:{type:'string'},description:{type:'string'},
                      benefits:{type:'array',items:{type:'string'}},
                      limitations:{type:'array',items:{type:'string'}},
                      faq:{type:'array',items:{type:'object',additionalProperties:false,required:['question','answer'],properties:{question:{type:'string'},answer:{type:'string'}}}},
                      cta:{type:'string'},visualDirection:{type:'string'}
                    }
                  }]))
                }
              }
            };
            const openAiPrompt = [
              'You are GLOBABOX AI, a senior Moroccan ecommerce creative director and conversion copywriter.',
              'Analyze the attached product photo and create a polished, mobile-first sales page brief for a modern Moroccan online store.',
              'Write natural Modern Standard Arabic for Moroccan shoppers, polished French, and clear English.',
              'Product name supplied by merchant: '+(productName||'Not supplied; identify only what is clearly visible.'),
              'Selling price MAD: '+(sellingPrice===null?'Not supplied; do not invent.':String(sellingPrice)),
              'Compare-at price MAD: '+(compareAtPrice===null?'Not supplied; do not invent.':String(compareAtPrice)),
              'Never invent specifications, materials, dimensions, compatibility, certifications, medical/cosmetic results, warranty, reviews, testimonials, delivery promises, scarcity or discounts.',
              'Only state facts supplied by merchant or unmistakably visible. Put uncertain claims in limitations as questions for merchant verification.',
              'Create a persuasive but honest headline, subheadline, useful product story, 3-5 grounded benefits/use cases, 2-4 useful FAQs, CTA and visual art direction.',
              'Choose a distinct visual composition for this exact product, not a generic repeated template. Select layout from split-editorial, centered-product, bold-commerce. Define a harmonious premium palette using six-digit hex colors for primary, accent, background, surface and text. Choose contained or cover heroStyle. The final public page is rendered as responsive HTML/CSS from these design decisions.\nUse concise, natural, culturally appropriate copy. Do not mention AI. The result will be edited by the merchant before publication.'
            ].join('\\n');
            const aiResponse = await fetch('https://api.openai.com/v1/responses', {
              method:'POST',
              headers:{'Authorization':'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},
              body:JSON.stringify({
                model:'gpt-5.5',
                input:[{role:'user',content:[
                  {type:'input_text',text:openAiPrompt},
                  {type:'input_image',image_url:imageData,detail:'high'}
                ]}],
                text:{format:{type:'json_schema',name:'globabox_landing_page',strict:true,schema}},
                max_output_tokens:5000
              })
            });
            if(!aiResponse.ok){
              console.error('[GLOBABOX] OpenAI generation request failed with HTTP status',aiResponse.status);
              return json({error:aiResponse.status===401?'OpenAI API key is invalid. Check the OPENAI_API_KEY secret.':aiResponse.status===429?'OpenAI API quota or rate limit reached. Check API billing and usage limits.':'OpenAI AI service could not generate the page. Check API access and try again.'},502);
            }
            const payload:any=await aiResponse.json();
            const outputText=typeof payload.output_text==='string'?payload.output_text:
              (Array.isArray(payload.output)?payload.output.flatMap((item:any)=>Array.isArray(item.content)?item.content:[]).filter((part:any)=>part.type==='output_text'&&typeof part.text==='string').map((part:any)=>part.text).join(''):'');
            if(!outputText.trim())return json({error:'OpenAI returned no page content. Please retry.'},502);
            try { generated=JSON.parse(outputText); }
            catch { console.error('[GLOBABOX] OpenAI structured response was not parseable JSON.'); return json({error:'OpenAI returned an unreadable page structure. Please retry.'},502); }
          } else {
            if (!env.AI) return json({error:'AI is not configured. Add OPENAI_API_KEY as a Cloudflare secret, or bind Cloudflare Workers AI.'},503);
            const model='@cf/meta/llama-3.2-11b-vision-instruct';
            let aiResult:any;
            try {
              aiResult=await env.AI.run(model,{prompt,image:imageData,max_tokens:5000,temperature:0.45});
            } catch (firstError) {
              const message=String(firstError);
              if (!message.includes('Prior to using this model') && !message.includes('must submit the prompt')) throw firstError;
              console.info('[GLOBABOX] Submitting the user-approved one-time Meta model license acceptance.');
              await env.AI.run(model,{prompt:'agree'});
              aiResult=await env.AI.run(model,{prompt,image:imageData,max_tokens:5000,temperature:0.45});
            }
            const raw=typeof aiResult?.response==='string'?aiResult.response:typeof aiResult?.result==='string'?aiResult.result:'';
            if(!raw.trim())return json({error:'Cloudflare AI returned an empty response. Please retry.'},502);
            const cleaned=raw.trim().replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'');
            try { generated=JSON.parse(cleaned); }
            catch {
              const firstBrace=cleaned.indexOf('{'),lastBrace=cleaned.lastIndexOf('}');
              if(firstBrace<0||lastBrace<=firstBrace){console.error('[GLOBABOX] Cloudflare AI response is not JSON. Length:',raw.length);return json({error:'Cloudflare AI did not return a valid page structure. Please retry.'},502);}
              try { generated=JSON.parse(cleaned.slice(firstBrace,lastBrace+1)); }
              catch { console.error('[GLOBABOX] Cloudflare AI JSON parsing failed.');return json({error:'Cloudflare AI returned an invalid page structure. Please retry.'},502); }
            }
          }
          if(!generated||typeof generated!=='object'||Array.isArray(generated)||!generated.content||typeof generated.content!=='object'){
            console.error('[GLOBABOX] AI response JSON is missing the required content object.');
            return json({error:'AI returned an incomplete page structure. Please retry.'},502);
          }
        } catch (error) {
          console.error('[GLOBABOX] AI landing-page generation failed',error);
          return json({error:'AI service is temporarily unavailable. Check the configured API secret and retry.'},502);
        }
        const cleanText=(v:any,max=1200)=>typeof v==='string'?v.trim().slice(0,max):'';
        const cleanCopy=(lang:'ar'|'fr'|'en')=>{const c=generated?.content?.[lang]||{};return{
          headline:cleanText(c.headline,180),subheadline:cleanText(c.subheadline,240),description:cleanText(c.description,1800),
          benefits:Array.isArray(c.benefits)?c.benefits.slice(0,6).map((x:any)=>cleanText(x,240)).filter(Boolean):[],
          limitations:Array.isArray(c.limitations)?c.limitations.slice(0,8).map((x:any)=>cleanText(x,240)).filter(Boolean):[],
          faq:Array.isArray(c.faq)?c.faq.slice(0,5).map((x:any)=>({question:cleanText(x?.question,180),answer:cleanText(x?.answer,400)})).filter((x:any)=>x.question&&x.answer):[],
          cta:cleanText(c.cta,80),visualDirection:cleanText(c.visualDirection,500)
        };};
        const designRaw=generated?.design||{};
        const safeDesignColor=(v:any,f:string)=>typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)?v:f;
        const design={layout:['split-editorial','centered-product','bold-commerce'].includes(designRaw.layout)?designRaw.layout:'split-editorial',primary:safeDesignColor(designRaw.primary,'#104d43'),accent:safeDesignColor(designRaw.accent,'#d69b43'),background:safeDesignColor(designRaw.background,'#f6f8f7'),surface:safeDesignColor(designRaw.surface,'#ffffff'),text:safeDesignColor(designRaw.text,'#172b27'),heroStyle:['contained','cover'].includes(designRaw.heroStyle)?designRaw.heroStyle:'contained'};
        const content={ar:cleanCopy('ar'),fr:cleanCopy('fr'),en:cleanCopy('en'),design};
        if(!content.ar.headline||!content.fr.headline||!content.en.headline)return json({error:'Cloudflare AI content is incomplete. Please generate again.'},502);
        const title=cleanText(generated.title,120)||productName||'New product';
        const rawSlug=cleanText(generated.slug,80).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const slug=(rawSlug.replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64)||'produit')+'-'+crypto.randomUUID().slice(0,6);
        const id=crypto.randomUUID(),imageUrl=new URL('/api/product-media/'+mediaId,request.url).href;
        const written=await env.DB.prepare('INSERT INTO landing_pages (id,slug,title,image_url,media_id,price_mad,compare_at_price_mad,content_json,status) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,slug,title,imageUrl,mediaId,sellingPrice,compareAtPrice,JSON.stringify(content),'draft').run();
        if(!written.success||written.meta?.changes!==1)return json({error:'Draft could not be saved to the database.'},503);
        console.info('[GLOBABOX] Landing page generated successfully.');
        return json({page:{id,slug,title,imageUrl,images,price:sellingPrice,compareAtPrice,content,status:'draft',productId:null}},201);
      }
      if (path === '/api/admin/landing-pages' && method === 'POST') {
        if(!await auth(request,env))return json({error:'Unauthorized'},401);
        const body=await readBody(request),id=typeof body?.id==='string'?body.id:'',title=typeof body?.title==='string'?body.title.trim().slice(0,120):'',content=body?.content;
        const imageUrls=Array.isArray(body?.images)?body.images.filter((x:unknown)=>typeof x==='string').slice(0,10) as string[]:[];
        const safeImages:string[]=[];for(const value of imageUrls){try{const parsed=new URL(value);const match=parsed.origin===new URL(request.url).origin&&parsed.pathname.match(/^\/api\/product-media\/([a-f0-9-]{36})$/i);if(match){const exists=await env.DB.prepare('SELECT id FROM product_media WHERE id=?').bind(match[1]).first();if(exists)safeImages.push(parsed.href);}}catch{}}
        if(imageUrls.length!==safeImages.length)return json({error:'Gallery contains an invalid or unavailable image.'},400);
        if(!/^[a-f0-9-]{36}$/i.test(id))return json({error:'Invalid landing page ID.'},400);
        if(!title||!content||!content.ar?.headline||!content.fr?.headline||!content.en?.headline)return json({error:'Complete all three language versions before saving.'},400);
        const price=body.price==null?null:Number(body.price),compare=body.compareAtPrice==null?null:Number(body.compareAtPrice);
        if(price!==null&&(!Number.isFinite(price)||price<=0))return json({error:'Invalid selling price.'},400);
        if(compare!==null&&(!Number.isFinite(compare)||compare<=0||(price!==null&&compare<=price)))return json({error:'Invalid comparison price.'},400);
        const productId=typeof body.productId==='string'&&body.productId.trim()?body.productId.trim():null;
        if(productId){
          const productRow=await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(productId).first<{data_json:string;active:number}>();
          if(!productRow||productRow.active!==1)return json({error:'Choose an active store product.'},409);
          const product=JSON.parse(productRow.data_json);
          if(product.isActive===false||product.inStock!==true||product.stockStatus==='out_of_stock'||!Number.isFinite(product.price)||product.price<=0)return json({error:'The selected product must have a verified price and available stock.'},409);
        }
        const priceConfirmed=body.priceConfirmed===true,comparePriceConfirmed=body.comparePriceConfirmed===true;
        if(compare!==null&&!comparePriceConfirmed)return json({error:'Confirm the comparison price separately, or remove it before saving for publication.'},409);
        const updated=await env.DB.prepare('UPDATE landing_pages SET title=?,product_id=?,price_mad=?,compare_at_price_mad=?,content_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(title,productId,price,compare,JSON.stringify({...content,_gallery:safeImages.length?safeImages:undefined,_priceConfirmed:priceConfirmed,_comparePriceConfirmed:comparePriceConfirmed}),id).run();
        if(!updated.success||updated.meta?.changes!==1)return json({error:'Landing page not found or not saved.'},404);
        const row=await env.DB.prepare('SELECT id,slug,title,product_id,image_url,price_mad,compare_at_price_mad,content_json,status,created_at,updated_at FROM landing_pages WHERE id=?').bind(id).first<any>();
        const storedContent=JSON.parse(row.content_json),images=Array.isArray(storedContent._gallery)?storedContent._gallery:[row.image_url];delete storedContent._gallery;
        const priceConfirmed=storedContent._priceConfirmed===true,comparePriceConfirmed=storedContent._comparePriceConfirmed===true;delete storedContent._priceConfirmed;delete storedContent._comparePriceConfirmed;
        return json({page:{id:row.id,slug:row.slug,title:row.title,productId:row.product_id||null,imageUrl:row.image_url,images,price:row.price_mad,compareAtPrice:row.compare_at_price_mad,priceConfirmed,comparePriceConfirmed,content:storedContent,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at}});
      }
      const landingPublishMatch=path.match(/^\/api\/admin\/landing-pages\/([a-f0-9-]{36})\/publish$/i);
      if(landingPublishMatch&&method==='POST'){
        if(!await auth(request,env))return json({error:'Unauthorized'},401);
        const row=await env.DB.prepare('SELECT product_id,price_mad,compare_at_price_mad,content_json FROM landing_pages WHERE id=? LIMIT 1').bind(landingPublishMatch[1]).first<{product_id:string|null;price_mad:number|null;compare_at_price_mad:number|null;content_json:string}>();
        if(!row)return json({error:'Landing page not found.'},404);
        if(!row.product_id)return json({error:'Map this page to a real store product before publishing.'},409);
        const savedContent=JSON.parse(row.content_json||'{}');
        if(savedContent._priceConfirmed!==true)return json({error:'Confirm the selling price manually before publishing.'},409);
        if(row.compare_at_price_mad!==null&&savedContent._comparePriceConfirmed!==true)return json({error:'Confirm the comparison price separately before publishing, or remove it.'},409);
        const productRow=await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(row.product_id).first<{data_json:string;active:number}>();
        if(!productRow||productRow.active!==1)return json({error:'The mapped product is not published.'},409);
        const product=JSON.parse(productRow.data_json);
        if(product.isActive===false||product.inStock!==true||product.stockStatus==='out_of_stock'||!Number.isFinite(product.price)||product.price<=0)return json({error:'The mapped product must have a verified price and available stock.'},409);
        if(!Number.isFinite(row.price_mad)||row.price_mad<=0||row.price_mad!==product.price)return json({error:'The manually confirmed landing-page price must exactly match the mapped store product price. Update and confirm it again.'},409);
        const updated=await env.DB.prepare("UPDATE landing_pages SET status='published',updated_at=CURRENT_TIMESTAMP,published_at=CURRENT_TIMESTAMP WHERE id=?").bind(landingPublishMatch[1]).run();
        if(!updated.success||updated.meta?.changes!==1)return json({error:'Publication was not confirmed by D1.'},503);
        const published=await env.DB.prepare('SELECT id,slug,title,product_id,image_url,price_mad,compare_at_price_mad,content_json,status,created_at,updated_at FROM landing_pages WHERE id=?').bind(landingPublishMatch[1]).first<any>();
        return json({success:true,page:{id:published.id,slug:published.slug,title:published.title,productId:published.product_id,imageUrl:published.image_url,price:published.price_mad,compareAtPrice:published.compare_at_price_mad,content:JSON.parse(published.content_json),status:published.status,createdAt:published.created_at,updatedAt:published.updated_at},url:new URL('/lp/'+published.slug,request.url).href});
      }
      const landingOrderMatch=path.match(/^\/api\/landing-pages\/([a-z0-9-]{1,80})\/order$/);
      if(landingOrderMatch&&method==='POST'){
        if(env.STORE_ACCEPTING_ORDERS!=='true')return json({error:'La boutique n’accepte pas encore les commandes.'},503);
        const page=await env.DB.prepare("SELECT product_id FROM landing_pages WHERE slug=? AND status='published' LIMIT 1").bind(landingOrderMatch[1]).first<{product_id:string|null}>();
        if(!page?.product_id)return json({error:'Cette page de vente n’est plus disponible.'},404);
        const productRow=await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(page.product_id).first<{data_json:string;active:number}>();
        if(!productRow||productRow.active!==1)return json({error:'Le produit n’est plus disponible.'},409);
        const product=JSON.parse(productRow.data_json);
        if(product.isActive===false||product.inStock!==true||product.stockStatus==='out_of_stock'||!Number.isFinite(product.price)||product.price<=0)return json({error:'Le produit n’est plus disponible.'},409);
        const subtotal=Math.round(product.price*100)/100,shippingCost=subtotal>=500?0:35,total=subtotal+shippingCost;
        const body=await readBody(request);
        if(body?.privacyConsent!==true&&body?.privacyConsent!=='true')return json({error:'Please accept the privacy notice before placing your order.'},400);
        const {privacyConsent,...orderDetails}=body||{};
        const quote=quoteOrder({...orderDetails,items:[{productId:page.product_id,quantity:1}],subtotal,shippingCost,total},[{...product,id:page.product_id,isActive:true}]);
        if('error' in quote)return json({error:quote.error},quote.status);
        const record=await persistValidatedOrder(env.DB,quote);
        const attributed={...record,source:'landing-page',landingPageSlug:landingOrderMatch[1],privacyConsent:{accepted:true,policyVersion:'landing-v1',acceptedAt:new Date().toISOString()}};
        const saved=await env.DB.prepare('UPDATE orders SET data_json=? WHERE id=?').bind(JSON.stringify(attributed),record.id).run();
        if(!saved.success||saved.meta?.changes!==1)return json({error:'La commande a été créée mais son attribution n’a pas été confirmée. Contactez GLOBABOX avec la référence '+record.reference},503);
        return json({success:true,order:attributed},201);
      }
      if (path === '/api/products' && method === 'GET') return json(await listProducts(env.DB, false, env.STORE_DEMO_CATALOG === 'true'));
      if (path === '/api/admin/products' && method === 'GET') {
        if (!await auth(request, env)) return json({ error: 'Unauthorized' }, 401);
        // The authenticated admin catalogue must include unpublished drafts.
        // Never mix bundled demo products into the real merchant inventory.
        return json(await listProducts(env.DB, true, false));
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
        const status = ['pending','no_answer','confirmed','processing','picked_up','shipped','out_for_delivery','delivered','returned','cancelled'].includes(order.status)
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
        const rows = await env.DB.prepare("SELECT data_json FROM orders WHERE COALESCE(json_extract(data_json, '$.adminDeletedAt'), '') = '' ORDER BY created_at DESC").all<{ data_json: string }>();
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
          // Soft-delete from the Admin UI only. The order remains in D1 for history,
          // reporting and recovery, but the normal Admin list will not return it after refresh.
          const oldOrder = JSON.parse(existing.data_json);
          const hiddenOrder = {
            ...oldOrder,
            adminDeletedAt: new Date().toISOString(),
            adminDeleted: true,
            updatedAt: new Date().toISOString()
          };
          const write = await env.DB.prepare(
            'UPDATE orders SET data_json=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
          ).bind(JSON.stringify(hiddenOrder), resolvedId).run();
          if (!write.success || write.meta?.changes !== 1)
            return json({error:'D1 did not confirm order archive'},503);
          return json({success:true, archived:true, orderId:resolvedId});
        }
        const update = await readBody(request);
        const allowed = ['pending','no_answer','confirmed','processing','picked_up','shipped','out_for_delivery','delivered','returned','cancelled'];
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
      const reviewMatch = path.match(/^\/api\/products\/([^/]+)\/reviews$/);
      if (reviewMatch && method === 'GET') {
        const productId = decodeURIComponent(reviewMatch[1]);
        const productRows = await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(productId).all<{data_json:string,active:number}>();
        if (!productRows.results[0] || productRows.results[0].active !== 1) return json({error:'Product not found'},404);
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS product_reviews (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          verified INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`).run();
        const rows = await env.DB.prepare('SELECT id,name,rating,comment,verified,created_at FROM product_reviews WHERE product_id=? ORDER BY created_at DESC LIMIT 50').bind(productId).all<any>();
        return json({reviews: rows.results.map(row => ({id:String(row.id),name:String(row.name||''),rating:Number(row.rating),comment:String(row.comment),verified:Number(row.verified)===1,createdAt:String(row.created_at)}))});
      }
      if (reviewMatch && method === 'POST') {
        const productId = decodeURIComponent(reviewMatch[1]);
        const productRows = await env.DB.prepare('SELECT data_json,active FROM products WHERE id=? LIMIT 1').bind(productId).all<{data_json:string,active:number}>();
        if (!productRows.results[0] || productRows.results[0].active !== 1) return json({error:'Product not found'},404);
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS product_reviews (
          id TEXT PRIMARY KEY,
          product_id TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          verified INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`).run();
        const body = await readBody(request);
        const rating = Number(body?.rating);
        const name = typeof body?.name === 'string' ? body.name.trim().slice(0,80) : '';
        const comment = typeof body?.comment === 'string' ? body.comment.trim().slice(0,1000) : '';
        const reference = typeof body?.orderReference === 'string' ? body.orderReference.trim().toUpperCase() : '';
        const rawPhone = typeof body?.phone === 'string' ? body.phone.trim() : '';
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return json({error:'Invalid review'},400);
        if (rawPhone.length > 32 || reference.length > 50) return json({error:'Invalid verification data'},400);
        let verified = 0;
        if (reference && rawPhone) {
          const normalisePhone = (value:string) => {
            const digits=value.replace(/[^0-9]/g,'');
            if(digits.startsWith('00212')) return digits.slice(5);
            if(digits.startsWith('212')) return digits.slice(3);
            return digits.startsWith('0') ? digits.slice(1) : digits;
          };
          const phone = normalisePhone(rawPhone);
          if (/^GB-[A-Z0-9-]{6,36}$/.test(reference) && /^[5-7][0-9]{8}$/.test(phone)) {
            const orderRow = await env.DB.prepare("SELECT data_json FROM orders WHERE UPPER(json_extract(data_json, '$.reference')) = ? LIMIT 1").bind(reference).first<{data_json:string}>();
            if (orderRow) {
              const order = JSON.parse(orderRow.data_json);
              const phoneMatches = normalisePhone(String(order.phoneNumber || '')) === phone;
              const productMatches = Array.isArray(order.items) && order.items.some((item:any) => String(item.productId || '') === productId);
              if (phoneMatches && productMatches && order.status !== 'cancelled') verified = 1;
            }
          }
        }
        const id = `rev_${crypto.randomUUID()}`;
        const inserted = await env.DB.prepare('INSERT INTO product_reviews (id,product_id,name,rating,comment,verified) VALUES (?,?,?,?,?,?)').bind(id,productId,name,rating,comment,verified).run();
        if (!inserted.success || inserted.meta?.changes !== 1) return json({error:'Review was not saved'},503);
        const aggregate = await env.DB.prepare('SELECT AVG(rating) AS average, COUNT(*) AS count FROM product_reviews WHERE product_id=?').bind(productId).first<{average:number,count:number}>();
        const stored = productRows.results[0].data_json ? JSON.parse(productRows.results[0].data_json) : {};
        const nextProduct = {...stored,rating:Number(aggregate?.average || 0),reviewsCount:Number(aggregate?.count || 0)};
        const updated = await env.DB.prepare('UPDATE products SET data_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(JSON.stringify(nextProduct),productId).run();
        if (!updated.success || updated.meta?.changes !== 1) return json({error:'Review aggregate update was not confirmed'},503);
        return json({success:true,verified:Boolean(verified),rating:nextProduct.rating,reviewsCount:nextProduct.reviewsCount},201);
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
        // Provisional sourced products require explicit stock, supplier and image-rights checks.
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
