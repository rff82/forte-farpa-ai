# CLAUDE.md — farpa Forte
> Arquivo de contexto automático · rff82/forte-farpa-ai · v2.0 · 2026-04-19 · **PIVÔ Editorial Navy Performance**

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

- **Tema padrão = LIGHT** com navy primary (#1A2B4C). Alto contraste é toggle SECUNDÁRIO que ativa o modo DARK (#0A0B0D + orange primary). Classe no body: `.theme-alto-contraste`.
- **Paleta Editorial Navy** — navy #1A2B4C primary + orange #F97316 secondary. Orange só aparece em dark/alto-contraste e highlights sutis.
- **WCAG AA mínimo** — Rodrigo tem baixa visão, é requisito de existência. Contraste texto ≥ 4.5:1. Light mode: navy sobre branco dá 12.5:1; dark mode: orange sobre #0A0B0D dá 8.9:1.
- **API keys nunca no cliente** — sempre `wrangler secret put`.
- **Cores nunca hardcoded** — sempre `var(--forte-xxx)` ou `var(--token)`. Usar `--forte-primary` (navy) ou `--forte-secondary` (orange) conforme papel.
- **Tipografia imutável pós-pivô** — Lexend (ui + display) + JetBrains Mono (numerais/datas). NÃO voltar para Plus Jakarta Sans.
- **Radius editorial** — 4px base (`--radius-md`), 6px lg, 8px xl, 12px 2xl. Override em `forte.css :root`.
- **Nunca modificar** arquivos sincronizados de `shared/` neste repo; editar na raiz e re-sincronizar.
- **Auth cross-site** — cookie de sessão `forte_sid` emitido como `HttpOnly; Secure; SameSite=None; Partitioned; Path=/`. `SameSite=Lax` quebra login (incidente 2026-04-18). Helper `sessionCookie()` + `clearSessionCookie()` em `workers/forte-worker/src/index.ts`.
- **Logo unificado** — `<div class="farpa-logo">` com `--logo-mark-bg: var(--forte-accent)` (que aponta para navy primary no light, orange no dark). Nunca SVG próprio.
- **Ícones SVG line (Lucide)** via `<span data-icon="nome"></span>` + `icons.js`. Nunca emojis em UI funcional (microcopy/toast OK).
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
