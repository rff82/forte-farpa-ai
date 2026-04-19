// forte-worker · lib/http.ts · 2026-04-19
// Helpers HTTP + CORS + cookie — cross-site Partitioned (U5)

const ALLOWED_ORIGINS = [
  'https://forte.farpa.ai',
  'https://forte-farpa-ai.pages.dev',
  'https://farpa.ai',
  'https://admin.farpa.ai',
  'http://localhost:3000',
  'http://localhost:8787',
];

export function corsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':      allowed,
    'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Accept-Language',
    'Access-Control-Allow-Credentials': 'true',
    'Vary':                             'Origin, Accept-Language',
  };
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function jsonResp(data: unknown, status = 200, extra: Record<string,string> = {}) {
  return Response.json(data, { status, headers: extra });
}

// ── Session cookie (U5: SameSite=None; Secure; Partitioned) ──
// NUNCA usar SameSite=Lax aqui — quebrou login em 2026-04-18.
export function sessionCookie(sid: string, maxAge = 86400): string {
  return [
    `forte_sid=${sid}`, 'Path=/', 'HttpOnly', 'Secure',
    'SameSite=None', 'Partitioned', `Max-Age=${maxAge}`,
  ].join('; ');
}

export function clearSessionCookie(): string {
  return [
    'forte_sid=', 'Path=/', 'HttpOnly', 'Secure',
    'SameSite=None', 'Partitioned', 'Max-Age=0',
  ].join('; ');
}

// ── Locale negotiation (U1 — PT-BR + EN nativo, não traduzido) ──
export function detectLocale(request: Request): 'pt-BR' | 'en' {
  const h = (request.headers.get('Accept-Language') || '').toLowerCase();
  if (h.startsWith('en')) return 'en';
  return 'pt-BR';
}
