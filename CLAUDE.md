# CLAUDE.md — farpa Forte
> Arquivo de contexto automático · rff82/forte-farpa-ai · v3.0 · 2026-04-19 · **PIPELINE F1-F7 COMPLETO · LIVE**

---

## ⚡ STATUS DO PIPELINE (2026-04-19)

Produto concluiu o ciclo completo Research → Deploy sob ADR 012 + 013. Relatório final obrigatório: [`07-relatorio-criacao.md`](07-relatorio-criacao.md).

| Recurso CF provisionado | Valor |
|---|---|
| Worker URL | `https://forte-worker.rfelipefernandes.workers.dev` |
| Worker Version ID | `2015ae74-eb8a-432e-bbe6-019c9567db29` |
| D1 | `forte-farpa-ai-db` (22 tabelas · schemas v1+v2+v3 aplicados remote) |
| KV | `FORTE_CACHE` (`048067c702bf426d948203c9cc185c95`) |
| R2 bucket | `forte-exports` |
| Queues | `forte-export-queue` (producer+consumer) + `forte-export-dlq` |
| Cron | `*/5 * * * *` (purge GDPR exports) |
| AI binding | Workers AI (Tier 1) · fallback Gemini (Tier 2) · ADR 014 |

### Épicos P0 implementados (F6 PRD)

E1 auth cross-site · E2 onboarding PT · E3 dual-mode aluno · E4 anamnese versionada · E5 IA dual-tier com redact + gate `pt_reviewed` · E6 Pix manual (ADR 016) · E7 comunidade 3 níveis (backlog ativado parcial) · E8 LGPD export HMAC one-shot · E9 demo isolada · E10 bilíngue nativo · E11 modo simples · E12 CI matrix 6 browsers · E13 notificações (email apenas no MVP; SMS/WhatsApp revisão 2026-05-04).

### ADRs vigentes neste produto
- ADR 014 — IA dual-tier + Comunidade fora do MVP
- ADR 015 — Onboarding dual-mode (PT vs aluno)
- ADR 016 — Pix manual sem gateway

---

> 🏛️ **Constituição farpa.ai v4.0** · ADR 012 + 013 · Herda 8 invariantes universais (U1-U8) · Toda evolução via [Orquestrador](../farpa-reengenharia/07-personas/01-orquestrador.md) com pergunta-trava *"pontual vs completo?"*. Ver [`../farpa-reengenharia/CLAUDE.md`](../farpa-reengenharia/CLAUDE.md).
> 🔄 **DS em transição (ADR 012)** — `tokens.css` / `themes.css` / `components.css` / `theme-engine.js` / `icons.js` são **próprios deste produto**, sem sync externo. Re-DS retroativo via pipeline completo quando o produto for tocado para mudança estrutural.

---

## IDENTIDADE DO PRODUTO

**forte.farpa.ai** é uma plataforma SaaS para personal trainers gerenciarem alunos, agenda, pagamentos e evolução física. Acesso dual: professor e aluno. Parte do ecossistema farpa — construído por Rodrigo.

**Categoria de mercado:** fitness / personal training SaaS B2B.
**Concorrentes benchmark:** Trainerize, Hevy, TrueCoach, Strava (consumer), Peloton (consumer premium).

---

## DESIGN SYSTEM — Editorial Navy Performance (pivô 2026-04-19)

Veredito pós-iteração no Google Stitch (projeto `10669266773153741819`). Registro do pivô em `farpa-reengenharia/02-design-system/05-trend-research.md` §"Pivô forte 2026-04-19".

```
Primary:         #1A2B4C  (Deep Navy — herdado do logo FARPA gerado)
Primary hover:   #102038
Secondary:       #F97316  (Strava orange — reservada p/ dark/alto-contraste)
Success/PR:      #22C55E  (emerald — substitui Cyber Lime no light mode)
Background:      #FFFFFF  (light-first editorial)
Surface:         #F8FAFC
Surface variant: #F1F5F9
Border:          #E2E8F0
Text primary:    #1A2B4C
Text secondary:  #475569
Text muted:      #94A3B8
Fonts:           Lexend + JetBrains Mono (imutáveis a partir deste pivô)
Tema padrão:     LIGHT
Alto contraste:  DARK #0A0B0D com primary = #F97316 (toggle via #btn-alto-contraste)
Radius:          ROUND_FOUR (4px base, 6 lg, 8 xl) — editorial architectural
```

**Por que o pivô:** pesquisa anterior (Peloton/WHOOP dark) foi superada pela direção "Performance Editorial" — tipografia Lexend, cantos de 4px, navy corporativo com orange reservado para momentos de celebração (alto contraste/dark mode). A paleta ecoa diretamente o logo FARPA em Deep Navy Blue.

**Compatibilidade com regras mestre do ecossistema:**
- Regra global 7 (trend per category) — pesquisa revisada e registrada no laboratório
- Regra global 8 (alto contraste é toggle secundário) — **mantida**: light é padrão, dark é toggle
- Regra anterior "nunca índigo como primary aqui" — **removida neste pivô**, navy vira primary; orange vira secondary
- Tokens compartilhados (`tokens.css`/`themes.css`) continuam intocados; overrides ficam em `forte.css`

Ordem de carregamento obrigatória:
```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="themes.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="logo-system.css">
<link rel="stylesheet" href="forte.css">
<script src="icons.js"></script>
<script src="theme-engine.js"></script>
```

> ⚠️ `theme-engine.js` gerencia `#btn-alto-contraste` via `farpa-tema` em `localStorage`. NÃO adicionar handler inline de alto contraste — conflito com o engine. O tema persiste entre todas as páginas automaticamente.

---

## ESTRUTURA DO REPOSITÓRIO

```
/
├── index.html              ← landing page (público)
├── login.html              ← login professor/aluno
├── forte.css               ← CSS específico (orange + dark) — NÃO sync
├── tokens.css              ← design system base (próprio · own (ADR 012))
├── themes.css              ← temas (próprio · own (ADR 012))
├── components.css          ← componentes (próprio · own (ADR 012))
├── logo-system.css         ← logo unificado (próprio · own (ADR 012))
├── theme-engine.js         ← switcher de tema (próprio · own (ADR 012))
├── icons.js                ← biblioteca SVG line Lucide (próprio · own (ADR 012))
├── schema.sql              ← schema D1 completo
├── professor/
├── aluno/
├── workers/forte-worker/
├── .github/workflows/ci.yml
└── CLAUDE.md
```

> ⚠️ `tokens.css` / `themes.css` / `logo-system.css` / `theme-engine.js` / `icons.js` são **próprios deste produto** (ADR 012 revogou sync compartilhado). Editar livremente até re-DS retroativo via pipeline completo.

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

- **Tema padrão = LIGHT** com navy primary (#1A2B4C). Alto contraste é toggle SECUNDÁRIO que ativa o modo DARK (#0A0B0D + orange primary). Classe no body: `.theme-alto-contraste`.
- **Paleta Editorial Navy** — navy #1A2B4C primary + orange #F97316 secondary. Orange só aparece em dark/alto-contraste e highlights sutis.
- **WCAG AA mínimo** — Rodrigo tem baixa visão, é requisito de existência. Contraste texto ≥ 4.5:1. Light mode: navy sobre branco dá 12.5:1; dark mode: orange sobre #0A0B0D dá 8.9:1.
- **API keys nunca no cliente** — sempre `wrangler secret put`.
- **Cores nunca hardcoded** — sempre `var(--forte-xxx)` ou `var(--token)`. Usar `--forte-primary` (navy) ou `--forte-secondary` (orange) conforme papel.
- **Tipografia imutável pós-pivô** — Lexend (ui + display) + JetBrains Mono (numerais/datas). NÃO voltar para Plus Jakarta Sans.
- **Radius editorial** — 4px base (`--radius-md`), 6px lg, 8px xl, 12px 2xl. Override em `forte.css :root`.
- **DS autônomo (ADR 012)** — `tokens.css` / `themes.css` / `components.css` / `theme-engine.js` / `icons.js` são deste produto; sem fonte externa de sync. Mudanças estruturais no DS passam por pipeline completo (re-DS retroativo).
- **Auth cross-site** — cookie de sessão `forte_sid` emitido como `HttpOnly; Secure; SameSite=None; Partitioned; Path=/`. `SameSite=Lax` quebra login (incidente 2026-04-18). Helper `sessionCookie()` + `clearSessionCookie()` em `workers/forte-worker/src/index.ts`.
- **Logo unificado** — `<div class="farpa-logo">` com `--logo-mark-bg: var(--forte-accent)` (que aponta para navy primary no light, orange no dark). Nunca SVG próprio.
- **Ícones SVG line (Lucide)** via `<span data-icon="nome"></span>` + `icons.js`. Nunca emojis em UI funcional (microcopy/toast OK).
- **Sem números inventados** em landing — ou puxa de D1, ou não mostra (pitch honesto: Grátis / ~2min / Edge).
- **Cloudflare Free Tier** — 100k Worker req/dia, D1 5M reads/100k writes.

---

## COMANDOS DE PROVISIONAMENTO

```bash
# Recursos já provisionados em 2026-04-19 (Onda C F7).
# Comandos abaixo são idempotentes — úteis para recriar em novo ambiente.

# Banco D1 + migrations (schemas v1/v2/v3 já aplicados em remote)
npx wrangler d1 create forte-farpa-ai-db         # já existe: 224c3411-1ddf-4805-a82d-316568ddbb71
npx wrangler d1 execute forte-farpa-ai-db --remote --file ./schema.sql
npx wrangler d1 execute forte-farpa-ai-db --remote --file ./schema_v2.sql
npx wrangler d1 execute forte-farpa-ai-db --remote --file ./schema_v3.sql

# KV
npx wrangler kv namespace create FORTE_CACHE     # já existe: 048067c702bf426d948203c9cc185c95

# R2 + Queues (Onda C)
npx wrangler r2 bucket create forte-exports
npx wrangler queues create forte-export-queue
npx wrangler queues create forte-export-dlq

# Secrets obrigatórios (via `wrangler secret put` · U6)
cd workers/forte-worker
npx wrangler secret put CLIENT_SECRET
npx wrangler secret put SESSION_COOKIE_SECRET    # openssl rand -base64 48
npx wrangler secret put GEMINI_API_KEY           # Tier 2 IA (ADR 014)
npx wrangler secret put EXPORT_HMAC_SECRET       # E8 one-shot download GDPR
npx wrangler secret put ANAMNESIS_CRYPTO_KEY     # E4 anamnese versionada
npx wrangler secret put ALLOWED_ORIGIN           # https://forte.farpa.ai

# Deploy
npx wrangler deploy
```

---

## FLUXO PADRÃO

```
Editar → commit → push main → CI GitHub Actions → CF Pages + Worker (~2 min)
```

---

## HISTÓRICO DE FALHAS DE CI
> Registro automático escrito pelo job `record-failure` em `.github/workflows/ci.yml`.
> Cada entrada abaixo foi uma falha real — consultar antes de repetir mesma operação.
> Regra mestre: `farpa-reengenharia/06-operacional/09-ci-self-healing.md`.

### 2026-04-18 · commit e0b7ddd

- **Pages:** failure (não rodou)
- **Worker:** failure (não rodou)
- **Run:** https://github.com/rff82/forte-farpa-ai/actions/runs/24607713261
- **Sintoma:** run registrada como `.github/workflows/ci.yml` (path em vez do `name:`), zero jobs criados, endpoint `/actions/runs/{id}/jobs` retornou `total_count: 0`.

<details><summary>Causa raiz</summary>

YAML parser interpretou `---` isolado em coluna 1 dentro de heredoc `cat >> CLAUDE.md <<'EOT'` como separador de documento YAML. O literal block (`run: |`) termina quando encontra linha em indentação menor — e `---` em col 1 está fora do bloco, disparando o erro `expected a single document in the stream`.

</details>

> **Lição:** nunca colocar `---` isolado em coluna 1 dentro de `run: |` no YAML. Usar `SEP="---"` + `echo "$SEP"`, ou manter o separador sempre indentado junto ao conteúdo. Fix aplicado em `.github/workflows/ci.yml` e propagado em `orchestrator-farpa/templates/ci.yml.tmpl` (commit subsequente).

---

*farpa Forte · CLAUDE.md · v1.1 · 2026-04-18*
