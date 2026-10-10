import type { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';

/** Protect private API routes. ADMIN_API_KEY must be server-only and >= 32 chars. */
export function requireAdminApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || expected.length < 32) {
    res.status(503).json({ error: 'Admin API not configured' });
    return;
  }
  const supplied = req.get('x-admin-api-key') || '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
