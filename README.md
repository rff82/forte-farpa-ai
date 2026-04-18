# farpa Forte

Agenda e gestão completa para personal trainers — alunos, sessões, pagamentos e evolução.

**Subdomínio:** forte.farpa.ai  
**Acento:** #F97316 (laranja)  
**Stack:** HTML + CSS + Cloudflare Workers + D1 + KV + Workers AI

## Estrutura

```
/                   → landing page + login
/professor/         → dashboard, alunos, agenda, pagamentos
/aluno/             → dashboard, evolução
/workers/forte-worker/ → API Cloudflare Worker
```

## Provisionamento

Ver `CLAUDE.md` para comandos completos.

```bash
# D1
npx wrangler d1 create forte-farpa-ai-db

# KV
npx wrangler kv namespace create FORTE_CACHE

# Schema
npx wrangler d1 execute forte-farpa-ai-db --file ./schema.sql --remote

# Secrets
cd workers/forte-worker
npx wrangler secret put CLIENT_SECRET
npx wrangler secret put SESSION_COOKIE_SECRET
npx wrangler secret put ALLOWED_ORIGIN

# Deploy
npx wrangler deploy
```

## Design System

Compartilhado com o ecossistema farpa — `tokens.css`, `themes.css`, `theme-engine.js` (sync de `shared/`).  
`forte.css` é específico deste produto.

Parte do ecossistema [farpa.ai](https://farpa.ai).
