import { PRODUCTS } from '../src/data';

interface Env { DB: D1Database; ASSETS: Fetcher; ADMIN_USERNAME?: string; ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string; ADMIN_API_KEY?: string }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const readBody = async (request: Request) => { try { return await request.json() as any; } catch { return null; } };
const publicProduct = (p: any) => p && p.isActive !== false;
async function auth(request: Request, env: Env): Promise<boolean> {
  const key = request.headers.get('x-admin-api-key');
  if (key && env.ADMIN_API_KEY && env.ADMIN_API_KEY.length >= 32) return key === env.ADMIN_API_KEY;
  return false;
}
async function listProducts(db: D1Database, includeDrafts: boolean) {
  const rows = await db.prepare(includeDrafts ? 'SELECT data_json FROM products ORDER BY created_at DESC' : 'SELECT data_json FROM products WHERE active = 1 ORDER BY created_at DESC').all<{ data_json: string }>();
  if (!includeDrafts && rows.results.length === 0) return PRODUCTS.filter(publicProduct);
  return rows.results.map(x => JSON.parse(x.data_json));
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url), path = url.pathname, method = request.method;
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(request);
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
        if (!data || typeof data !== 'object' || !Array.isArray(data.items) || !data.items.length || !data.customer)
          return json({ error: 'Invalid order' }, 400);
        const id = crypto.randomUUID(), record = { ...data, id, status: 'pending', createdAt: new Date().toISOString() };
        await env.DB.prepare('INSERT INTO orders (id,status,total_mad,data_json) VALUES (?,?,?,?)')
          .bind(id, 'pending', Number(data.total) || 0, JSON.stringify(record)).run();
        return json({ success: true, order: record }, 201);
      }
      const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
      if ((path === '/api/products' && method === 'POST') || (productMatch && ['PUT','DELETE'].includes(method))) {
        if (!await auth(request, env)) return json({error:'Unauthorized'},401);
        const id = productMatch?.[1] || crypto.randomUUID();
        if (method === 'DELETE') {
          await env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run();
          return json({success:true});
        }
        const p = await readBody(request);
        if (!p || typeof p.name?.fr !== 'string' || !Number.isFinite(p.price) || p.price <= 0) return json({error:'Invalid product'},400);
        const row = { ...p, id, isActive: p.isActive === true };
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
