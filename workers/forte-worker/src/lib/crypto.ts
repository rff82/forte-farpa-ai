// forte-worker · lib/crypto.ts · 2026-04-19
// PBKDF2 + SHA-256 + HMAC helpers

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH       = 'SHA-256';
const SALT_BYTES        = 16;
const KEY_BYTES         = 32;

export function base64url(buf: Uint8Array): string {
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(s: string): Promise<string> {
  const bits = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt   = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMat = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits   = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: PBKDF2_HASH }, keyMat, KEY_BYTES * 8);
  const key    = new Uint8Array(bits);
  return btoa(String.fromCharCode(...salt)) + ':' + btoa(String.fromCharCode(...key));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, keyB64] = stored.split(':');
  if (!saltB64 || !keyB64) return false;
  const salt     = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const expected = Uint8Array.from(atob(keyB64),  c => c.charCodeAt(0));
  const keyMat   = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits     = await crypto.subtle.deriveBits({ name:'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: PBKDF2_HASH }, keyMat, KEY_BYTES * 8);
  const derived  = new Uint8Array(bits);
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
  return diff === 0;
}

// HMAC-SHA256 para tokens one-shot de export (E8)
export async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign','verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64url(new Uint8Array(sig));
}

export async function hmacVerify(secret: string, payload: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(secret, payload);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export function randomId(bytes = 8): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2,'0')).join('');
}
