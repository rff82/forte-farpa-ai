# Handoff Operacional — farpa Forte
> Fase F8 (retroativa, executada como pre-go-live) · Processo P28 · ADR 018 · v1.0 · 2026-04-19
> Estudo técnico MVP/POC
> Status: **APROVADO** — go-live plena liberada após M5 + R3 (feature flag) resolvidos

**Responsáveis:** COO/CX (`super-customer-ops` + `super-customer-success`) + CHRO (`super-talent-development`) + CFO Super FP&A
**Insumos:** `07-relatorio-criacao.md` · `02b-charter/` · `06b-dd-vendors/` · ADR 014/015/016

---

## 1. Seção COO/CX — Runbook Operacional e SLA

### 1.1 SLA MVP

| Dimensão | Alvo MVP | Medição |
|---|---|---|
| Disponibilidade Worker | 99.5% mensal (best-effort Free+Workers Paid) | Cloudflare Analytics |
| Latência p95 rotas principais | < 800 ms edge | Logs Worker |
| Resposta a ticket AI-first | < 5 min first response | P20 dataset |
| Resolução ticket sev-1 | < 4 h | Runbook incident |
| Resolução ticket sev-2 | < 24 h úteis | Runbook incident |
| Resolução ticket sev-3 | < 72 h úteis | Runbook incident |
| Confirmação Pix (manual) | < 48 h após recibo anexado | ADR 016 + auditoria D1 |

**Severidades:**
- **sev-1:** produto offline · auth quebrada global · vazamento de dados confirmado · IA gerando plano sem revisão PT (gate violado)
- **sev-2:** feature core quebrada para ≥10% dos usuários · Pix não reconcilia após 48h · atraso notificação > 2h
- **sev-3:** bug cosmético · dúvida de uso · pedido de feature

### 1.2 Runbook por cenário

**Cenário A — Auth quebrada cross-site (repete incidente 2026-04-18):**
1. Verificar `sessionCookie()` em `workers/forte-worker/src/index.ts` — triplet `SameSite=None; Secure; Partitioned` intacto.
2. `npx wrangler tail forte-worker` e buscar por `set-cookie`.
3. Se `SameSite=Lax` vazou em deploy: rollback imediato via `npx wrangler rollback <version-id>` para `2015ae74-eb8a-432e-bbe6-019c9567db29` (v1 live).
4. Abrir issue `ci-failure` + registrar em `CLAUDE.md > HISTÓRICO DE FALHAS DE CI`.

**Cenário B — Worker down:**
1. `curl -sI https://forte-worker.rfelipefernandes.workers.dev` → se não-200: `wrangler deployments list` e rollback.
2. Se Cloudflare incidente global: esperar + comunicar usuários via email (manual).

**Cenário C — D1 lenta / quota:**
1. `wrangler d1 info forte-farpa-ai-db` → checar reads/writes diários.
2. Free Tier: 5M reads / 100k writes/dia. Se próximo: ativar cache KV agressivo em `get_workout_plans`.

**Cenário D — Pix não confirma em 48h:**
1. PT abre ticket → COO/CX cola link do recibo anexado + verifica hash em `payments.receipt_hash`.
2. Conciliação manual por Super Tesouraria (ADR 016) — Rodrigo arbitra enquanto volume < 100 recibos/mês.

**Cenário E — IA gerou plano sem revisão PT:**
1. **sev-1 imediato.** Bug no gate `pt_reviewed` = risco regulatório CFM/CREF.
2. Desativar E5 via feature flag `AI_ENABLED=false`.
3. Auditoria D1: `SELECT * FROM workout_plans WHERE pt_reviewed_at IS NULL AND sent_to_student_at IS NOT NULL;`
4. Notificar alunos afetados + PT responsável + DPO.
5. ADR de incidente + relatório ANPD avaliado pelo CLO.

### 1.3 Fluxo P20 — Ticket AI-First com Handoff Cowork

**Entrada (MVP):** email `suporte@forte.farpa.ai` + formulário na página `/ajuda` (a implementar em D+14).

**Pipeline:**
1. Ticket entra → classifica severidade por keywords (`não confirma`, `não entra`, `erro`, `urgente` → sev-1/2; `como faço`, `dúvida` → sev-3).
2. Sev-3: AI-first responde via template de FAQ (Gemini com contexto do produto).
3. Sev-1/2: AI abre ticket e escala imediatamente ao Rodrigo via email + WhatsApp.
4. Handoff Cowork Anthropic: **deferido para D+90** (após massa crítica > 20 tickets/semana). No MVP, COO/CX opera com Rodrigo como resolver humano.

**Métrica primária:** resolution quality (survey pós-ticket com nota 1-5), não deflection rate. Meta: ≥ 4.2/5 em janela de 30d.

### 1.4 P29 — Handoff Close-to-Operations

**Trigger:** quando Super Vendas fecha um PT beta (convite direto, hoje Rodrigo faz outreach).

**Payload obrigatório no handoff:**
- Dor principal declarada pelo PT
- Número atual de alunos
- Promessa feita em venda (ex.: "Pix em 48h · IA revisada")
- Meta 90d do PT (ex.: 20 alunos ativos no Forte)
- Alertas de risco (ex.: "PT nunca usou SaaS antes — Modo Simples recomendado")

**Dual-track 90d:** Super Vendas + Customer Success acompanham juntos. D+90 Customer Success assume integralmente. Upsell detectado em P20 → devolve lead ao Super Vendas.

---

## 2. Seção CHRO — PL1–PL5 para personas do Forte

### 2.1 PL1 Intake (retroativo — completo via Charter F2.5)

Todas as 12 personas físicas ativas no Forte têm perfil canônico em `farpa-reengenharia/07-personas/` e memória específica em `99-memoria/<persona>/forte-farpa-ai/` a materializar (M6 do Charter).

### 2.2 PL2 Onboarding (completo)

Personas foram ativadas no pipeline F1→F7 com pergunta-trava, gate reviews e ADRs 014/015/016 como evidência de onboarding bem-sucedido.

### 2.3 PL3 Operação contínua (ativo)

Cada persona continua ativa no ciclo operacional do Forte conforme chamado pelo Orquestrador.

### 2.4 PL4 Avaliação trimestral (planejada)

**Primeira avaliação P18:** Q2 2026 (fim de junho). Scorecard em 4 dimensões:
- **Qualidade:** aderência ao escopo da persona (ex.: Super Backend propôs solução Backend, não invadiu Frontend)
- **Segurança/compliance:** zero violações U1–U8 detectadas em revisão
- **Confiabilidade:** gate review passou na primeira tentativa?
- **Eficiência:** ciclo completo em X dias vs baseline (Forte fez F1→F7 em 3 dias — baseline estabelecido)

Dataset de eval por persona: amostrar 5 interações/trimestre; revisor humano = Rodrigo; zero métrica inventada (U8).

### 2.5 PL5 Retirement (não aplicável ainda)

Nenhuma persona em subutilização no momento do handoff.

### 2.6 Gaps D7 identificados

- **CREF Specialist (humano externo) via P17 Trilha C** — trigger: 50 PTs ativos ou primeira questão regulatória concreta.
- **DPO humano certificado via P17 Trilha C** — trigger: D+90 ou primeiro RIPD formal.

---

## 3. Seção CFO FP&A — Unit Economics e Forecast

### 3.1 Unit economics finais (MVP live)

| Métrica | Valor | Fonte |
|---|---|---|
| Custo fixo mensal | R$ 30 (Workers Paid $5 + reservas R$ ~5) | CF dashboard + reserva interna |
| Custo marginal por PT ativo | R$ 0 até ~1.000 PTs | Free Tier CF D1/KV/R2/Queues |
| Custo por recibo Pix | R$ 0 | ADR 016 (manual) |
| Custo médio por chamada IA (MVP) | R$ 0 Tier 1 (Workers AI free) · < R$ 0,01 Tier 2 fallback | Estimativa Gemini paid tier |
| Custo projetado Gemini 90d | < R$ 5/mês (assume 5% das chamadas caem no Tier 2) | Projeção conservadora |

### 3.2 Forecast 90d (baseado em metas PRD)

| Marco | PTs ativos | WAU (PTs × 7 dias) | Alunos ativos | Custo CF | Receita MVP |
|---|---|---|---|---|---|
| D+30 (M1) | 10 | ~7 | ~50 | R$ 30 | R$ 0 (beta grátis) |
| D+60 | 25 | ~18 | ~150 | R$ 30 | R$ 0 |
| **D+90 (M2)** | **50** | **~35** | **~300** | **R$ 35** | **R$ 0 (beta)** |

**Trigger pricing:** introduzir plano Pro **após D+90** com base nos sinais de 50 PTs ativos reais. Antes disso: grátis para beta fechado.

### 3.3 Modelo de pricing futuro (esboço pós-MVP)

**Plano Free (permanente):** até 10 alunos · Pix manual · 1 mensagem IA/semana · sem agendamento via link público.

**Plano Pro (lançamento ~D+120 se M2 validada):** R$ 29–49/mês · alunos ilimitados · IA ilimitada · notificações SMS/WhatsApp · link público de agendamento · export personalizado.

**Plano Team (backlog P2):** R$ 99–149/mês · até 3 PTs na mesma conta · comunidade ativa.

Gatilho de revisão: primeira coorte paga (≥ 20 conversões Free→Pro em 30d) define se o pricing fica ou sobe.

### 3.4 Guardrails Free Tier

| Limite CF | Alerta em | Ação |
|---|---|---|
| Workers 100k req/dia | 60k (60%) | Revisar frequência de polling frontend |
| D1 5M reads/dia | 3M (60%) | Intensificar cache KV |
| D1 100k writes/dia | 60k | Batch writes + audit trail assíncrono |

---

## 4. Declaração Founder — produto em operação plena

Ao assinar este handoff, o Founder declara:
- forte.farpa.ai está em operação plena sob SLA acima.
- COO/CX opera P20 (tickets) a partir de 2026-04-19.
- CHRO inclui Forte no ciclo P18 Q2 2026.
- CFO FP&A inclui Forte no fechamento mensal P8 a partir de maio/2026.
- Vendor alerts P24 monitoram Cloudflare + Gemini a partir de agora.

**Espaço para assinatura:** _______________________ (Rodrigo Felipe Fernandes · Founder · data)

---

## 5. Dashboard de saúde inicial (a implementar)

Página interna `/admin/health` (D+14, owner Super Frontend + Super Backend) com métricas reais do D1:
- PTs ativos (últimos 7d)
- Alunos ativos
- Sessões registradas/semana
- Recibos Pix confirmados
- Chamadas IA (Tier 1 vs Tier 2) + taxa de `pt_reviewed`
- Tickets abertos/fechados
- Latência p95 por rota

**U8 estrito:** nenhum número inventado — se métrica não existir em D1, página exibe "aguardando dados".

---

## 6. Veredito F8 consolidado

| Assinatura | Parecer |
|---|---|
| **COO/CX** super-customer-ops + super-customer-success | **APROVADO** · runbook operacional vigente; handoff Cowork adiado para D+90 |
| **CHRO** super-talent-development | **APROVADO** · PL1–PL3 vigentes; PL4 Q2 agendado; M6 aberto (memória por agent) |
| **CFO Super FP&A** | **APROVADO** · unit economics sustentáveis no MVP · guardrails Free Tier ativos |

**Produto declarado em operação plena** — pendências M5 (disclaimer bilíngue) e R3 (feature flag Gemini) são os únicos gates bloqueantes residuais, ambos resolvíveis em < 72h.

---

*farpa Forte · 08-handoff-operacional · v1.0 · 2026-04-19 · F8 pre-go-live · P28 · ADR 018 vigente*
