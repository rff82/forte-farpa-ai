# Vendor Charter — farpa Forte
> Fase F6.5 (retroativa) · Processo P27 · ADR 018 · v1.0 · 2026-04-19
> Estudo técnico MVP/POC
> Gate triplo obrigatório: CFO G4 · CLO G1 · CPO Super PM — todos abaixo
> Status: **APROVADO COM RESSALVAS** — ressalvas R1, R2, R4 devem ser resolvidas em D+30

**Responsáveis:** CFO G4 Vendor Management (owner) + CLO G1 Contratos & DPAs + CTO Super SecOps
**Insumos:** `02b-charter/charter-regulatorio.md` · `06-prd/00-prd.md` · ADR 014/016 · `wrangler.toml` atual

---

## 1. Inventário dos vendors do Forte

| # | Vendor | Uso no Forte | Dado processado | Região de processamento |
|---|---|---|---|---|
| V1 | Cloudflare (Workers + D1 + KV + R2 + Queues + Pages) | Núcleo operacional, armazenamento, edge compute | Todos (PII, saúde sensível, financeiro) | Edge global (anycast) |
| V2 | Cloudflare Workers AI | Inferência LLM Tier 1 (E5) | Prompts pós-redact PII | Edge global |
| V3 | Google Gemini API | Inferência LLM Tier 2 fallback (E5) | Prompts pós-redact PII | us-central / global |
| V4 | Cloudflare Email Workers | Notificações MVP (E13) | email + nome + conteúdo agenda | Edge global |
| V5 | GitHub | Versionamento + CI | Código fonte (não dados de usuário) | US |

---

## 2. V1 — Cloudflare (núcleo de infraestrutura)

### Scoring 3D (P23)
- Criticidade: **3** (falha = produto offline)
- Acesso a dados: **3** (armazena anamnese, medições corporais, pagamentos)
- Exposição financeira: **1** (Free + Workers Paid $5/mês atualmente)
- **Score: 9 · Tier 1 · DPA OBRIGATÓRIO**

### DPA & Compliance
- Cloudflare Data Processing Addendum público em https://www.cloudflare.com/cloudflare-customer-dpa/ — cobre LGPD (via GDPR bridge e cláusulas específicas) conforme contratação Pro/Business.
- **Plano atual: Free + Workers Paid.** DPA padrão aplicável aceitação via dashboard; suficiente para MVP mas sem SLA contratual.
- **ADR 021 do ecossistema já institui Cloudflare Tier 2 (paid) + DPA formal obrigatório para Health/Fintech.** O CLO estende esta política ao Forte por processar dados sensíveis de saúde (medições, anamnese).

### SLA
- Free Tier: sem SLA contratual (best-effort). Workers Paid $5: 99.99% uptime na SLA pública.
- Recomendação: permanecer no Workers Paid atual; upgrade para Business em D+180 se ARR > R$10k/mês.

### Ressalva R1 (bloqueante fraco)
Aceitação formal do DPA Cloudflare pela conta `rfelipefernandes@gmail.com` deve ser verificada no dashboard e o registro (screenshot + timestamp) arquivado em `farpa-reengenharia/09-configuracao/vendor-registry/cloudflare-dpa-2026.pdf`. **Prazo: D+30.**

### Recomendação CLO / Veredito CFO
**APROVADO com R1.** Cloudflare é Tier 1 com DPA aceito de forma programática ao usar o serviço; formalização documental é a ressalva aberta.

---

## 3. V2 — Cloudflare Workers AI

### Scoring 3D
- Criticidade: **2** (fallback Gemini existe; degradação, não outage)
- Acesso a dados: **2** (prompts pós-redact; redact imperfeito = risco)
- Exposição financeira: **1** (Free Tier com neurons/dia)
- **Score: 4 · Tier 2 · DPA recomendado**

### DPA & Compliance
- Cobertura implícita pelo DPA mestre Cloudflare (V1) — Workers AI é serviço Cloudflare.
- Política Cloudflare: dados de inferência não usados para treinar modelos em Workers AI. **Confirmado em documentação pública** mas recomenda-se print da seção para `vendor-registry`.

### Risco residual
Redact PII determinístico (regex para CPF, email, telefone) pode vazar dados em prompts longos. Mitigação: IA só roda sobre campos estruturados de `workout_plans` e nunca sobre texto livre de anamnese.

### Ressalva R2
Instrumentar assertion no backend: se `prompt` contém regex PII → bloqueia chamada e loga `ai_pii_leak_attempt`. **Prazo: D+30.**

### Veredito
**APROVADO com R2.**

---

## 4. V3 — Google Gemini API

### Scoring 3D
- Criticidade: **2** (fallback, não caminho principal)
- Acesso a dados: **2** (prompts pós-redact saem para infra Google)
- Exposição financeira: **1** (projeção < R$5/mês no MVP)
- **Score: 4 · Tier 2**

### DPA & Compliance
- **Google Cloud DPA** (`https://cloud.google.com/terms/data-processing-addendum`) vincula-se automaticamente a contas Google Workspace / Google Cloud quando aceito uma vez. Rodrigo usa conta `rfelipefernandes@gmail.com` com Google Cloud ativo (gcloud init confirmado).
- Gemini API via AI Studio tem termos separados dos Google Cloud — **paid tier é obrigatório** para garantir que prompts não sejam usados para treinamento de modelo. Free Tier AI Studio explicitamente usa prompts para melhoria.

### Ressalva R3 (bloqueante forte se não mitigada)
**Gemini API deve estar em modo paid** (via Google Cloud billing) antes do primeiro prompt com dados de aluno real. Verificação: `gcloud billing accounts list` + projeto com billing vinculado usado pela API key `GEMINI_API_KEY`. **Prazo: antes do primeiro fallback em produção** (MVP ainda não acionou Tier 2, então R3 é verificação obrigatória pré-primeira invocação). → **Escalável ao Founder se não confirmado até go-live + 24h.**

### Recomendação CLO
Se Rodrigo não tiver billing ativo no projeto Gemini, orientar migração imediata para modo paid ou desabilitar fallback Tier 2 temporariamente (E5 continua funcional com Workers AI apenas).

### Veredito
**APROVADO condicionado a R3** — CLO exige confirmação técnica antes do primeiro uso real.

---

## 5. V4 — Cloudflare Email Workers

### Scoring 3D
- Criticidade: **2** (notificações; delay tolerável)
- Acesso a dados: **2** (email, nome, conteúdo de agenda)
- Exposição financeira: **1** (free tier)
- **Score: 4 · Tier 2**

### DPA & Compliance
- Cobertura Cloudflare DPA mestre (V1).
- Conteúdo enviado: nome do aluno, horário de sessão, nome do PT. Nenhum dado sensível (anamnese) em email — **confirmado em E13**.

### Ressalva R4
Configurar SPF/DKIM/DMARC para `forte.farpa.ai` antes do envio em produção — senão emails caem em spam e danificam reputação do domínio mestre. **Prazo: D+14.** Owner: Super Infra.

### Veredito
**APROVADO com R4.**

---

## 6. V5 — GitHub

### Scoring 3D
- Criticidade: **3** (CI/CD depende)
- Acesso a dados: **1** (código, não dados de usuário; secrets via wrangler, não GitHub)
- Exposição financeira: **1** (free tier)
- **Score: 3 · Tier 2/3**

### Compliance
- Microsoft/GitHub DPA padrão aceito na criação da conta.
- U6 garante que nenhum secret vive em GitHub.

### Veredito
**APROVADO sem ressalvas.**

---

## 7. Registro canônico (`vendor-registry.yaml`)

Entries abaixo devem ser inseridas em `farpa-reengenharia/09-configuracao/vendor-registry.yaml` (criar se ainda não existe). Alertas P24 configurados a partir destes campos.

```yaml
vendors:
  - id: cloudflare-core
    product_scope: [forte-farpa-ai, all]
    tier: 1
    score_3d: 9
    dpa_status: accepted_programmatic
    dpa_formal_verification_deadline: 2026-05-19
    renewal_type: monthly_subscription
    notice_deadline: null
    contacts: [abuse@cloudflare.com]
    owner_super: super-infra
    residual_risk: [R1]

  - id: cloudflare-workers-ai
    product_scope: [forte-farpa-ai]
    tier: 2
    score_3d: 4
    dpa_status: inherits_cloudflare_core
    residual_risk: [R2]
    owner_super: super-ai

  - id: google-gemini-api
    product_scope: [forte-farpa-ai]
    tier: 2
    score_3d: 4
    dpa_status: google_cloud_dpa_pending_billing_verification
    residual_risk: [R3]
    blocker_pre_first_production_call: true
    owner_super: super-ai

  - id: cloudflare-email-workers
    product_scope: [forte-farpa-ai]
    tier: 2
    score_3d: 4
    dpa_status: inherits_cloudflare_core
    residual_risk: [R4]
    owner_super: super-infra

  - id: github
    product_scope: [forte-farpa-ai, all]
    tier: 3
    score_3d: 3
    dpa_status: accepted_at_signup
    owner_super: super-infra
```

---

## 8. Ressalvas consolidadas e impacto no go-live

| ID | Vendor | Severidade | Prazo | Bloqueia go-live? |
|---|---|---|---|---|
| R1 | Cloudflare | Média | D+30 | Não |
| R2 | Workers AI | Média | D+30 | Não (IA atual já usa apenas dados estruturados) |
| R3 | Gemini API | **Alta** | Antes do 1º prompt real | **Sim** (se Tier 2 for acionado no MVP) |
| R4 | Email Workers | Média | D+14 | Não (afeta reputação, não legalidade) |

**Mitigação imediata para R3:** adicionar feature flag `AI_TIER2_ENABLED=false` em `wrangler.toml` até que billing Gemini paid seja confirmado por Rodrigo. Caminho E5 continua operando com Workers AI apenas.

---

## 9. Veredito Gate Triplo

| Gate | Assinatura | Parecer |
|---|---|---|
| **CFO G4 Fornecedores** | super-controladoria | **APROVADO COM RESSALVAS** · R1/R4 acompanhados; R3 condiciona fallback Tier 2 |
| **CLO G1 Contratos & DPAs** | super-contratos-ip | **APROVADO COM RESSALVAS** · formalização Cloudflare DPA (R1) e Gemini billing (R3) são follow-ups obrigatórios |
| **CPO Super PM & Delivery** | super-pm-delivery | **APROVADO** · follow-ups integrados ao roadmap 30d |

**Go-live autorizado** sob a condição operacional: feature flag `AI_TIER2_ENABLED=false` até R3 resolvido; R1/R2/R4 em follow-up rastreado.

---

*farpa Forte · 06b-dd-vendors · v1.0 · 2026-04-19 · F6.5 retroativa · P27 · ADR 018 + ADR 021 vigentes*
