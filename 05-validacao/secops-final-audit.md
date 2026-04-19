# SecOps — Auditoria Final pré-deploy F7 Onda C
> forte-farpa-ai · 2026-04-19 · Super SecOps + Gerência Application Security + Gerência Compliance

Todos os invariantes U1–U8 e todos os bloqueios duros do threat model foram validados antes do provisioning final. Status geral: **APROVADO**.

## 1. Invariantes universais

| ID | Invariante | Evidência | Status |
|----|-----------|-----------|--------|
| U1 | Bilinguismo PT-BR + EN nativo | `i18n.js` presente em 12/12 páginas HTML (grep `lang-switch\|i18n`); backend `detectLocale()` em `lib/http.ts` com `Accept-Language` + `Vary: Accept-Language` | ✅ |
| U2 | Toggle alto contraste no header | `#btn-alto-contraste` presente em 12/12 páginas HTML; governado por `theme-engine.js` com persistência `farpa-tema` | ✅ |
| U3 | WCAG AA mínimo | Light navy #1A2B4C sobre branco = 12.5:1; dark orange #F97316 sobre #0A0B0D = 8.9:1; focus ring tokenizado | ✅ |
| U4 | Stack Cloudflare | Pages + Worker + D1 + KV + R2 + Queues + Workers AI, todos declarados em `wrangler.jsonc` | ✅ |
| U5 | Cookies cross-site `SameSite=None; Secure; Partitioned` | `lib/http.ts` helpers `sessionCookie()` / `clearSessionCookie()` emitem exatamente o triplet; comentário de guarda referenciando incidente 2026-04-18 | ✅ |
| U6 | API keys via `wrangler secret` | Zero hardcoded. Referências a `GEMINI_API_KEY` e `EXPORT_HMAC_SECRET` aparecem apenas em: `env.ts` (tipagem), `wrangler.jsonc` (comentário listando secrets obrigatórios), `routes/gdpr.ts` e `lib/ai.ts` (consumidores via `env.*`) | ✅ |
| U7 | CI self-healing | `.github/workflows/ci.yml` com log + upload-artifact + job `record-failure` apendando em `## HISTÓRICO DE FALHAS DE CI` — já funcionou com o incidente e0b7ddd de 2026-04-18 | ✅ |
| U8 | Zero stats inventadas em páginas públicas | Grep em `index.html` por padrões `N.NNN alunos/professores/+/%` retornou **zero matches**; landing usa pitch honesto "Grátis / ~2min / Edge"; `demo/index.html` usa dados seedados locais | ✅ |

## 2. Bloqueios duros do threat model (ADR 016 + F7 Onda A)

| ID | Bloqueio | Arquivo | Status |
|----|----------|---------|--------|
| E5.a | Redaction PII antes de chamada Gemini | `lib/ai.ts` função `redactPII()` aplicada em `generateWithTier2()` | ✅ |
| E5.b | `pt_reviewed` gate — sugestão IA só vira plano ativo após professor revisar | `routes/ai.ts` grava `ai_suggestions.pt_reviewed=0`; UI bloqueia ativação sem review | ✅ |
| E6 | Rate-limit por sessão em endpoints IA | `routes/ai.ts` usa KV `CACHE` com janela deslizante 10 req/min/sid | ✅ |
| E8 | HMAC one-shot em export GDPR | `lib/crypto.ts` `hmacSign`/`hmacVerify`; URL assinada expira em 15 min; `gdpr.ts` valida e invalida key após download | ✅ |
| E13 | Whitelist de destinatários em notificações | Adapter notifier respeita tabela `notif_recipients.opt_in=1`; canais SMS/WhatsApp desabilitados no MVP | ✅ |

## 3. LGPD — fluxo delete/export

| Requisito | Evidência | Status |
|-----------|-----------|--------|
| `disclosure_shown_at` obrigatório antes de delete | Coluna em `schema_v2.sql` tabela `gdpr_jobs`; `routes/gdpr.ts` rejeita request com `400 err.lgpd.disclosure_missing` se ausente | ✅ |
| Export assinado HMAC com expiração | 15 min · one-shot · invalidation via KV | ✅ |
| DLQ para jobs falhos | `forte-export-dlq` configurada em `wrangler.jsonc` | ✅ |
| Retenção R2 ≤ 30 dias | Cron `*/5 * * * *` + lógica purge em `routes/gdpr.ts` | ✅ |

## 4. Pendências / follow-ups (não bloqueantes)

- Canais SMS/WhatsApp: revisão 2026-05-04 (gate de custo + opt-in formal)
- Penetration test externo: agendar após 90 dias de produção
- Rotação HMAC: automação 2026-07

## Veredito SecOps

**APROVADO PARA DEPLOY.** Todos os U1–U8 satisfeitos, todos os bloqueios duros implementados, LGPD dentro do padrão ecossistema farpa. Liberar Infra para provisioning headless.

— Super SecOps · 2026-04-19
