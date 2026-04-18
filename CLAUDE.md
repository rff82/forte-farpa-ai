# CLAUDE.md — farpa Forte
> Arquivo de contexto automático · rff82/forte-farpa-ai · v1.1 · 2026-04-18

---

## IDENTIDADE DO PRODUTO

**forte.farpa.ai** é uma plataforma SaaS para personal trainers gerenciarem alunos, agenda, pagamentos e evolução física. Acesso dual: professor e aluno. Parte do ecossistema farpa — construído por Rodrigo.

**Categoria de mercado:** fitness / personal training SaaS B2B.
**Concorrentes benchmark:** Trainerize, Hevy, TrueCoach, Strava (consumer), Peloton (consumer premium).

---

## DESIGN SYSTEM — paleta on-trend da categoria

Veredito da pesquisa obrigatória (WGSN A/W 25–26 + Mobbin + Dribbble 2026) registrado em `farpa-reengenharia/02-design-system/05-trend-research.md`:

```
Primary (superfície):  #0A0B0D  (Woodsmoke / near-black) — dark-first cinematic
Accent principal:      #F97316  (orange, Strava-like)
Accent secundário:     #A3E635  (Cyber Lime — WGSN 2026) para PRs/streaks
Warm light:            #F5F0EB  (Cloud Dancer — quiet luxury, conteúdo editorial)
Brand mestre farpa:    #4338CA  (índigo) — usar APENAS em gráficos secundários, nunca como primary
Fonts:                 Plus Jakarta Sans + JetBrains Mono (imutáveis)
Tema padrão:           Escuro (class="theme-escuro" no body)
```

**Por que dark + orange:** Peloton (Woodsmoke+Cardinal), Whoop (#0B0B0B+#FF0100) e Hevy consolidaram dark cinematic como padrão fitness atlético. Strava usa International Orange #FC4C02 como assinatura. Índigo genérico de SaaS B2B não carrega energia física.

**Fontes da pesquisa:** [Peloton Mobbin](https://mobbin.com/colors/brand/peloton) · [Strava Mobbin](https://mobbin.com/colors/brand/strava) · [WHOOP Mobbin](https://mobbin.com/colors/brand/whoop) · [WGSN Key Colours 26/27](https://www.wgsn.com/en/blog/key-colours-w-26-27) · [WGSN Colour of the Year 2026 — Transformative Teal](https://mr-mag.com/wgsn-and-coloro-announce-colour-of-the-year-2026-transformative-teal-and-the-key-colours-for-a-w-26-27/).

Ordem de carregamento obrigatória:
```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="themes.css">
<link rel="stylesheet" href="components.css">
<link rel="stylesheet" href="logo-system.css">
<link rel="stylesheet" href="forte.css">
<script src="icons.js"></script>
```

---

## ESTRUTURA DO REPOSITÓRIO

```
/
├── index.html              ← landing page (público)
├── login.html              ← login professor/aluno
├── forte.css               ← CSS específico (orange + dark) — NÃO sync
├── tokens.css              ← design system base (sync com shared/)
├── themes.css              ← temas (sync com shared/)
├── components.css          ← componentes (sync com shared/)
├── logo-system.css         ← logo unificado (sync com shared/)
├── theme-engine.js         ← switcher de tema (sync com shared/)
├── icons.js                ← biblioteca SVG line Lucide (sync com shared/)
├── schema.sql              ← schema D1 completo
├── professor/
├── aluno/
├── workers/forte-worker/
├── .github/workflows/ci.yml
└── CLAUDE.md
```

> ⚠️ `tokens.css` / `themes.css` / `logo-system.css` / `theme-engine.js` / `icons.js` → copiar de `../shared/` e não editar.

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

- **Alto contraste é toggle SECUNDÁRIO**, sempre no header (`#btn-alto-contraste` → `.theme-alto-contraste`). NÃO é o tema padrão. Tema padrão = dark cinematic on-trend (regra mestre do ecossistema).
- **Paleta on-trend fitness** — dark `#0A0B0D` + accent orange `#F97316`. Nunca índigo como primary aqui.
- **WCAG AA mínimo** — Rodrigo tem baixa visão, é requisito de existência. Contraste texto ≥ 4.5:1.
- **API keys nunca no cliente** — sempre `wrangler secret put`.
- **Cores nunca hardcoded** — sempre `var(--forte-xxx)` ou `var(--token)`.
- **Tipografia imutável** — Plus Jakarta Sans + JetBrains Mono.
- **Nunca modificar** arquivos sincronizados de `shared/` neste repo; editar na raiz e re-sincronizar.
- **Auth cross-site** — cookie de sessão `forte_sid` emitido como `HttpOnly; Secure; SameSite=None; Partitioned; Path=/`. `SameSite=Lax` quebra login (incidente 2026-04-18). Helper `sessionCookie()` + `clearSessionCookie()` em `workers/forte-worker/src/index.ts`.
- **Logo unificado** — `<div class="farpa-logo">` com `--logo-mark-bg: var(--forte-accent)`. Nunca SVG próprio.
- **Ícones SVG line (Lucide)** via `<span data-icon="nome"></span>` + `icons.js`. Nunca emojis em UI funcional.
- **Sem números inventados** em landing — ou puxa de D1, ou não mostra (pitch honesto: Grátis / ~2min / Edge).
- **Cloudflare Free Tier** — 100k Worker req/dia, D1 5M reads/100k writes.

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
