import { PRODUCTS } from '../src/data';
import { isAdmin, handleAdminAuth } from './auth';

interface Env { DB: D1Database; ASSETS: Fetcher; ADMIN_USERNAME?: string; ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string; ADMIN_API_KEY?: string }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const readBody = async (request: Request) => { try { return await request.json() as any; } catch { return null; } };
const publicProduct = (p: any) => p && p.isActive !== false;
const auth = isAdmin;
async function listProducts(db: D1Database, includeDrafts: boolean) {
  const rows = await db.prepare(includeDrafts ? 'SELECT data_json FROM products ORDER BY created_at DESC' : 'SELECT data_json FROM products WHERE active = 1 ORDER BY created_at DESC').all<{ data_json: string }>();
  if (!includeDrafts && rows.results.length === 0) return PRODUCTS.filter(publicProduct);
  return rows.results.map(x => JSON.parse(x.data_json));
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
    const authResponse = await handleAdminAuth(request, env);
    if (authResponse) return authResponse;
    if (!env.DB) return json({ error: 'Database binding missing' }, 503);
    try {
      if (path === '/api/products' && method === 'GET') return json(await listProducts(env.DB, false));
      if (path === '/api/admin/products' && method === 'GET') {
        if (!await auth(request, env)) return json({ error: 'Unauthorized' }, 401);
        return json(await listProducts(env.DB, true));
      }
      if (path === '/api/orders' && method === 'GET') {
        if (!await auth(request, env)) return json({ error: 'Unauthorized' }, 401);
        const rows = await env.DB.prepare('SELECT data_json FROM orders ORDER BY created_at DESC').all<{ data_json: string }>();
        return json(rows.results.map(row => JSON.parse(row.data_json)));
      }
      if (path === '/api/orders' && method === 'POST') {
        const data = await readBody(request);
        if (!data || typeof data !== 'object' || !Array.isArray(data.items) || !data.items.length || typeof data.fullName !== 'string' || !data.fullName.trim() || typeof data.phoneNumber !== 'string' || !data.phoneNumber.trim())
          return json({ error: 'Invalid order' }, 400);
        const id = crypto.randomUUID(), record = { ...data, id, status: 'pending', createdAt: new Date().toISOString() };
        await env.DB.prepare('INSERT INTO orders (id,status,total_mad,data_json) VALUES (?,?,?,?)')
          .bind(id, 'pending', Number(data.total) || 0, JSON.stringify(record)).run();
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
        if (!allowed.includes(update?.status)) return json({error:'Invalid order status'},400);
        const order = {...JSON.parse(existing.data_json),status:update.status,updatedAt:new Date().toISOString()};
        await env.DB.prepare('UPDATE orders SET status=?,data_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
          .bind(update.status,JSON.stringify(order),resolvedId).run();
        return json({success:true,order});
      }
      if (path === '/api/orders-clear' && method === 'DELETE') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
        return json({error:'Bulk deletion disabled for safety'},403);
      }
      if (path === '/api/import-products' && method === 'POST') {
        if (!await auth(request,env)) return json({error:'Unauthorized'},401);
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
          await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
          return json({success:true});
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
        const active = typeof p.isActive === 'boolean' ? p.isActive
          : previous ? previous.active === 1 : false;
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
