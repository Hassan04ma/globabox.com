export interface AdminEnv {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  ADMIN_API_KEY?: string;
}
const encoder = new TextEncoder();
const cookieName = 'gb_admin';
const secureCookie = 'HttpOnly; Secure; SameSite=Strict; Path=/api';
const ttlSeconds = 12 * 60 * 60;

async function mac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
}
function equal(a: string, b: string) {
  const aa = encoder.encode(a), bb = encoder.encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i=0; i<aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}
async function session(request: Request, env: AdminEnv) {
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) return false;
  const raw = (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName+'='));
  if (!raw) return false;
  const parts = raw.slice(cookieName.length+1).split('.');
  if (parts.length !== 2 || !/^\d+$/.test(parts[0])) return false;
  const age = Date.now() - Number(parts[0]);
  if (age < 0 || age > ttlSeconds * 1000) return false;
  return equal(parts[1],await mac(parts[0],env.ADMIN_SESSION_SECRET));
}
export async function isAdmin(request: Request, env: AdminEnv): Promise<boolean> {
  const header = request.headers.get('x-admin-api-key');
  if (header && env.ADMIN_API_KEY && env.ADMIN_API_KEY.length>=32 && equal(header,env.ADMIN_API_KEY)) return true;
  if (!await session(request,env)) return false;
  if (['GET','HEAD'].includes(request.method)) return true;
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(request.url).origin;
}
export async function handleAdminAuth(request: Request, env: AdminEnv): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (path === '/api/admin/session' && request.method === 'GET') {
    return Response.json({authenticated: await session(request, env)});
  }
  if (path === '/api/admin/logout' && request.method === 'POST') {
    if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Origin mismatch'},{status:403});
    return Response.json({authenticated:false},{headers:{'Set-Cookie':cookieName+'=; '+secureCookie+'; Max-Age=0'}});
  }
  if (path === '/api/admin/login' && request.method === 'POST') {
    if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Origin mismatch'},{status:403});
    if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 12 || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32)
      return Response.json({error:'Admin login not configured'},{status:503});
    let data: any;
    try { data = await request.json(); } catch { return Response.json({error:'Invalid body'},{status:400}); }
    if (!equal(String(data?.username||''),env.ADMIN_USERNAME||'admin') || !equal(String(data?.password||''),env.ADMIN_PASSWORD))
      return Response.json({error:'Unauthorized'},{status:401});
    const stamp = String(Date.now());
    const value = stamp+'.'+await mac(stamp,env.ADMIN_SESSION_SECRET);
    return Response.json({authenticated:true},{headers:{'Set-Cookie':cookieName+'='+value+'; '+secureCookie+'; Max-Age='+ttlSeconds}});
  }
  return null;
}
