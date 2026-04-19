// forte-worker · lib/session.ts · 2026-04-19
import type { Env } from '../env';
import { readCookie } from './http';

export interface Session {
  user_id: string;
  role:    'professor' | 'aluno' | string;
  name:    string;
  access_token?: string;
  id_token?:     string;
}

export async function requireSession(request: Request, env: Env): Promise<Session | null> {
  const sid = readCookie(request, 'forte_sid');
  if (!sid) return null;
  const raw = await env.CACHE.get(`session:${sid}`);
  return raw ? JSON.parse(raw) as Session : null;
}
