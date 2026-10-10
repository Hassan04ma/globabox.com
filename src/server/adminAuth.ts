import type { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
const name = 'gb_admin';
const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const secret = () => process.env.ADMIN_SESSION_SECRET || '';
const signature = (stamp: string) => createHmac('sha256', secret()).update(stamp).digest('hex');
const session = (req: Request) => {
  if (secret().length < 32) return false;
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  const [stamp, mac] = (cookie || '').slice(name.length + 1).split('.');
  if (!stamp || !mac || !/^\d+$/.test(stamp) || Date.now() - Number(stamp) > 43200000 || Number(stamp) > Date.now()) return false;
  return safeEqual(mac, signature(stamp));
};
export function requireAdminApiKey(req: Request, res: Response, next: NextFunction) {
  const key = process.env.ADMIN_API_KEY || '';
  const supplied = req.get('x-admin-api-key') || '';
  if (key.length >= 32 && supplied && safeEqual(supplied, key)) return next();
  if (session(req)) {
    const origin = req.get('origin');
    if (['GET','HEAD'].includes(req.method) || (origin && new URL(origin).host === req.get('host'))) return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}
export function adminLogin(req: Request, res: Response) {
  const password = process.env.ADMIN_PASSWORD || '';
  if (secret().length < 32 || password.length < 12) return res.status(503).json({error:'Admin login not configured'});
  if (!safeEqual(String(req.body?.username || ''), process.env.ADMIN_USERNAME || 'admin') ||
      !safeEqual(String(req.body?.password || ''), password)) return res.status(401).json({error:'Invalid credentials'});
  const stamp = String(Date.now());
  res.setHeader('Set-Cookie', name + '=' + stamp + '.' + signature(stamp) + '; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=43200');
  res.json({authenticated:true});
}
export function adminSession(req: Request,res: Response) { res.json({authenticated:session(req)}); }
export function adminLogout(_req: Request,res: Response) {
  res.setHeader('Set-Cookie', name + '=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0');
  res.json({authenticated:false});
}
