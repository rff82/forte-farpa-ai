# CLAUDE.md — farpa Forte
> Arquivo de contexto automático · rff82/forte-farpa-ai · v1.0 · 2026-04-17

---

## IDENTIDADE DO PRODUTO

**forte.farpa.ai** é uma plataforma SaaS para personal trainers gerenciarem alunos, agenda, pagamentos e evolução física. Acesso dual: professor e aluno. Parte do ecossistema farpa — construído por Rodrigo.

Acento: `#F97316` (laranja). Tema padrão: escuro.

---

## ESTRUTURA DO REPOSITÓRIO

```
/
├── index.html              ← landing page (público)
├── login.html              ← login professor/aluno
├── forte.css               ← CSS específico (laranja + dark) — NÃO sync
├── tokens.css              ← design system base (sync com shared/)
├── themes.css              ← temas (sync com shared/)
├── components.css          ← componentes (sync com shared/)
├── theme-engine.js         ← switcher de tema (sync com shared/)
├── schema.sql              ← schema D1 completo
├── professor/
│   ├── dashboard.html
│   ├── alunos.html
│   ├── agenda.html
│   └── pagamentos.html
├── aluno/
│   ├── dashboard.html
│   └── evolucao.html
├── workers/forte-worker/
│   ├── src/index.ts
│   ├── wrangler.jsonc
│   └── package.json
├── .github/workflows/ci.yml
└── CLAUDE.md
```

> ⚠️ `tokens.css` / `themes.css` / `theme-engine.js` → copiar de `../shared/` e não editar.
> `forte.css` é específico do produto — pode e deve ser editado.

---

## DESIGN SYSTEM

```
Primary:  #4338CA  (índigo — ADR 002)
Accent:   #F97316  (laranja — var(--forte-accent) em forte.css)
Fonts:    Plus Jakarta Sans + JetBrains Mono (imutáveis)
Tema:     Escuro por padrão (class="theme-escuro" no body)
```

Ordem de carregamento obrigatória:
```html
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../themes.css">
<link rel="stylesheet" href="../components.css">
<link rel="stylesheet" href="../forte.css">
<script src="../theme-engine.js"></script>
```

---

## INFRAESTRUTURA

```
Repositório:   github.com/rff82/forte-farpa-ai (branch main)
Pages project: forte-farpa-ai
Subdomínio:    forte.farpa.ai → CNAME forte-farpa-ai.pages.dev
Worker:        forte-worker
D1:            forte-farpa-ai-db · ID: {preencher após wrangler d1 create}
KV:            FORTE_CACHE      · ID: {preencher após wrangler kv namespace create}
Auth:          OAuth2/OIDC via admin.farpa.ai (IdP centralizado)
```

---

## REGRAS INEGOCIÁVEIS

- **Alto contraste sempre visível** no header — `id="btn-alto-contraste"`
- **WCAG AA mínimo** — Rodrigo tem baixa visão, é requisito de existência
- **API keys nunca no cliente** — sempre `wrangler secret put`
- **Cores nunca hardcoded** — sempre `var(--forte-xxx)` ou `var(--token)`
- **Tipografia imutável** — Plus Jakarta Sans + JetBrains Mono
- **Nunca modificar** `tokens.css` / `themes.css` / `theme-engine.js`
- **Auth** — cookie HttpOnly Secure SameSite=Lax (nunca localStorage para sessão)
- **Cloudflare Free Tier** — 100k Worker req/dia, D1 5M reads/100k writes

---

## COMANDOS DE PROVISIONAMENTO

```bash
# Banco D1
npx wrangler d1 create forte-farpa-ai-db
# → copiar database_id para workers/forte-worker/wrangler.jsonc

# KV
npx wrangler kv namespace create FORTE_CACHE
# → copiar id para workers/forte-worker/wrangler.jsonc

# Schema
npx wrangler d1 execute forte-farpa-ai-db --file ./schema.sql --remote

# Secrets
cd workers/forte-worker
npx wrangler secret put CLIENT_SECRET
npx wrangler secret put SESSION_COOKIE_SECRET   # openssl rand -base64 48
npx wrangler secret put ALLOWED_ORIGIN          # https://forte.farpa.ai

# Deploy
npx wrangler deploy
```

---

## FLUXO PADRÃO

```
Editar → commit → push main → CI GitHub Actions → CF Pages + Worker (~2 min)
```

---

*farpa Forte · CLAUDE.md · v1.0 · 2026-04-17*
