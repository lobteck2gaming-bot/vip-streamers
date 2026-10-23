import { useSession } from '@tanstack/react-start/server';
import { createHash, timingSafeEqual } from 'node:crypto';

export function passwordMatches(input: string, expected: string) {
  return timingSafeEqual(createHash('sha256').update(input).digest(), createHash('sha256').update(expected).digest());
}
export async function adminSession() {
  const password = process.env['SESSION_SECRET'];
  if (!password) throw new Error('Admin session is not configured');
  return useSession<{ unlocked?: boolean }>({ password, name: 'community-admin', maxAge: 60 * 60 * 8, cookie: { httpOnly: true, secure: process.env['NODE_ENV'] === 'production', sameSite: 'lax', path: '/' } });
}
export async function requireAdmin() {
  const session = await adminSession();
  if (!session.data.unlocked) throw new Error('Admin access required');
  return session;
}