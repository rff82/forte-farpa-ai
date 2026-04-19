// forte-worker · env.ts · 2026-04-19
// Tipagem central de Env (bindings + secrets)

export interface Env {
  // Core bindings
  DB:    D1Database;
  CACHE: KVNamespace;
  AI:    Ai;
  R2?:   R2Bucket;              // LGPD exports, community media (E8, E7)
  EXPORT_QUEUE?: Queue;         // fila async para export jobs (E8)

  // Vars públicas
  ENVIRONMENT:           string;
  PRODUCT_NAME:          string;
  CLIENT_ID:             string;
  ALLOWED_ORIGIN:        string;

  // Secrets (wrangler secret put)
  CLIENT_SECRET:         string;
  SESSION_COOKIE_SECRET: string;
  GEMINI_API_KEY?:       string;  // E5 tier 2
  EXPORT_HMAC_SECRET?:   string;  // E8 one-shot tokens
  EMAIL_FROM?:           string;  // E13
}
