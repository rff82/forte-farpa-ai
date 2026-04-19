# Charter Regulatório & Pessoas — farpa Forte
> Fase F2.5 (retroativa) · Processo P26 · ADR 018 · v1.0 · 2026-04-19
> Estudo técnico MVP/POC — ver disclaimer institucional em `farpa-reengenharia/07-personas/evolucao-v2/00-disclaimer-regulatorio.md`
> Status: **APROVADO COM RESSALVAS** — go-live condicionado à adoção dos mitigadores M1–M5

**Responsáveis:** CLO (`super-regulatorio-setorial`) + CHRO (`super-talent-development`) + CFO G4 Fornecedores
**Gate:** obrigatório antes de F3 — executado retroativamente por ADR 018 aplicado a produto live
**Insumos:** `02-discovery/` (7 personas) · `06-prd/00-prd.md` · ADR 014/015/016 · `05-validacao/secops-final-audit.md`

---

## 1. Seção CLO — Análise Regulatória

### 1.1 LGPD — Lei 13.709/2018

**Dados tratados (mapeamento):**

| Categoria | Tipo | Base legal (Art. 7) | Sensível (Art. 5 II)? |
|---|---|---|---|
| Identificação | nome, email, telefone, CPF (PT) | Execução de contrato (V) | Não |
| Financeiro | recibos Pix, chave Pix | Execução de contrato (V) | Não |
| Biométrico/corporal | medições (peso, circunferências, dobras) | Consentimento específico (I) + Tutela da saúde (VIII em interpretação extensiva) | **Sim — referentes à saúde** |
| Anamnese | histórico clínico, comorbidades, medicação | Consentimento específico (Art. 11 I) + Tutela da saúde (Art. 11 II f) | **Sim — saúde** |
| Treino | planos, cargas, séries | Execução de contrato | Não |
| Sessões | datas, presença, observações | Execução de contrato | Não |
| IA | prompts enviados a LLM (pós-redact) | Legítimo interesse (IX) + consentimento granular | Não após redact |

**Obrigações acionáveis:**

1. **Encarregado de Dados (DPO · Art. 41)** — **obrigatório** por tratamento de dados sensíveis em escala. Designação: CLO Super Contratos & IP (G2 Privacy & DPO) como DPO institucional do ecossistema; email `dpo@farpa.ai` a publicar. **Gap atual:** email ainda não configurado → M1.
2. **Consentimento granular e destacável (Art. 8 §4)** — um opt-in por finalidade: (a) tratamento de anamnese, (b) medições corporais, (c) uso de IA sobre dados de treino, (d) comunicação marketing. **Gap atual:** onboarding do aluno (E3) não separa os 4 opt-ins → M2.
3. **Direitos do titular (Art. 18)** — acesso, correção, eliminação, portabilidade. E8 (LGPD export HMAC one-shot) cobre acesso/portabilidade. **Gap:** ausência de fluxo explícito de eliminação com preservação de logs legais (Art. 16) → M3.
4. **Retenção** — políticas propostas: anamnese e medições 5 anos após última sessão (paralelo CFM 1.821/2007 para prontuário); dados financeiros 5 anos (LC 123/2006); logs de auditoria 6 meses. **Gap:** cron `*/5 * * * *` purga exports mas não há purge de dados operacionais por retenção → M4.
5. **Relatório de Impacto (RIPD · Art. 38)** — recomendável por tratamento sistemático de dados sensíveis + IA. Primeira versão será produzida pelo CLO em D+30 pós-go-live.
6. **Incidentes (Art. 48)** — obrigação de notificação ANPD em prazo razoável. Runbook de incidente em P6 (SecOps) + P20 (COO/CX) deve incluir gatilho ANPD.

**Veredito LGPD:** **aprovado com ressalvas** · M1 (email DPO) e M2 (consentimento granular) são **bloqueantes fracos** — exigidos antes do 10º aluno cadastrado.

### 1.2 Regulatório Fitness BR — CFM/CREF

**Marco legal:**
- Lei 9.696/1998 regulamenta a profissão; Resolução CONFEF 046/2002 define ato profissional privativo.
- Prescrição de exercício físico é ato privativo do profissional de Educação Física registrado no CREF.
- A presença do selo CREF no cadastro do PT é **diferencial de posicionamento**, não assunção de responsabilidade do Forte.

**Risco regulatório principal — IA prescritiva (ADR 014):**
A feature E5 (IA dual-tier) gera sugestões de treino. Se apresentada como "prescrição", o Forte exerceria ato privativo do profissional de EF sem habilitação — risco ético e regulatório.

**Mitigação adotada (bloqueante):**
- **IA é assistente do PT, nunca do aluno.** Output da IA é entregue ao PT, não ao aluno.
- **Gate obrigatório `pt_reviewed`** (ADR 014): nenhum plano de treino gerado por IA chega ao aluno sem revisão/aprovação explícita do PT via checkbox com timestamp e nome completo do profissional. Auditado em D1 (tabela `workout_plans.pt_reviewed_at` + `pt_reviewed_by`).
- **Disclaimer em toda tela que exibe output de IA** (M5 abaixo).
- **Sem recomendação autônoma ao aluno.** App do aluno jamais recebe sugestão de IA sem passar pelo PT.

**Gaps:**
- Landing/marketing do Forte não pode comunicar "IA que prescreve treinos" — apenas "IA que assiste o profissional a prescrever". Verificação em `index.html` pendente → M5.

**Veredito CFM/CREF:** **aprovado** desde que o gate `pt_reviewed` permaneça imutável e que marketing respeite a linguagem de assistência.

### 1.3 AI Governance — P22 Gate F2.5

**Frameworks de referência:**
- **NIST AI RMF 1.0** (Govern/Map/Measure/Manage) — aplicável como boa prática.
- **EU AI Act** — Forte não processa dados de cidadãos europeus no MVP (go-to-market BR-only); risco deployer reativado se/quando expandir.
- **PL 2338/2023 (BR)** — em tramitação; prever rastreabilidade de decisões de IA (quem gerou, qual modelo, quais dados, quem aprovou).

**Classificação (NIST):**
- Uso: "decision-support for licensed professional" (assistência, não autonomia) → **Risco Limited**
- Mitigação estrutural já no produto: human-in-the-loop obrigatório (gate `pt_reviewed`), redact PII antes de envio a LLM externo (Gemini Tier 2), fallback determinístico para regra básica se IA indisponível.

**Controles exigidos por P22 F2.5 (instrumentar até F6.5):**
1. Logging de cada chamada de IA: `ai_call_id`, `model`, `tier`, `prompt_hash`, `pii_redacted:bool`, `latency_ms`, `pt_id`, `reviewed:bool`.
2. Dataset de avaliação mensal: 20 prompts amostrais revisados por humano para detectar drift.
3. Disclaimer visível (U1 bilíngue).
4. Red team inicial pré-escala: tentativa de jailbreak de "IA sem revisão do PT" — agendar D+45.

**Veredito AI Governance:** **aprovado como Risco Limited** com controles de logging obrigatórios.

### 1.4 Disclaimer MVP/POC obrigatório (ADR 018 §9)

> **AVISO — farpa Forte MVP · PT-BR**
>
> farpa Forte é um estudo técnico em fase inicial (MVP). A assistência por IA integrada ao produto tem caráter de apoio ao profissional de Educação Física registrado no CREF e não substitui avaliação, prescrição ou acompanhamento profissional. Todo plano de treino exibido ao aluno foi revisado e aprovado pelo seu personal trainer responsável. O Forte não presta serviço médico nem emite diagnóstico. Em caso de sintomas, dor ou desconforto, procure um profissional de saúde.

> **NOTICE — farpa Forte MVP · EN**
>
> farpa Forte is an early-stage technical study (MVP). AI assistance is a support tool for CREF-registered physical education professionals and does not replace professional assessment, prescription or supervision. Every training plan shown to a student has been reviewed and approved by the responsible personal trainer. Forte does not provide medical services nor issue diagnoses. If you experience symptoms, pain or discomfort, seek a healthcare professional.

**Colocação obrigatória:** footer de todas as páginas do app do aluno, tela de output de IA do PT, landing page section "Como funciona".

---

## 2. Seção CHRO — Registro de Personas e PL1

### 2.1 Personas sintéticas criadas durante o pipeline

**Validação F5 — 7 personas fictícias (registradas em `02-discovery/`):**

| ID | Nome | Papel | Cidade | Status PL |
|---|---|---|---|---|
| P-RAFA | Rafael | PT 32a, CrossFit, ~25 alunos | Rio/SP | PL1 completo |
| P-JU | Juliana | PT 28a, yoga+funcional, 12 alunas | SP | PL1 completo |
| P-LUCAO | Lucão | PT 45a, musculação, 40 alunos | Brasília | PL1 completo |
| P-CLARA | Clara | PT 36a, corrida, 18 alunos | POA | PL1 completo |
| P-MARCOS | Marcos | PT 41a, reabilitação, 20 alunos | Recife | PL1 completo |
| P-BIA | Bia | aluna 24a, iniciante | — | PL1 completo |
| P-ANTONIO | Seu Antônio | aluno 67a, Modo Simples | — | PL1 completo |

**Equipe multidisciplinar acionada (agents físicos — ADR 013/018):**

| Agent | Fase de atuação | Status PL |
|---|---|---|
| orquestrador | F1→F7 | ativo desde 2026-04-19 |
| super-research-discovery | F1/F2/F5 | ativo |
| super-uxcx-design | F3/F4 | ativo |
| super-pm-delivery | F6 | ativo |
| super-infra | F7 | ativo |
| super-frontend | F7 | ativo |
| super-backend | F7 | ativo |
| super-ai | F7 | ativo |
| super-secops | F7 | ativo |
| super-fpa | F7 (gate custo) | ativo |
| super-tesouraria-caixa | F7 (Pix) | ativo |
| super-brand | F3 (tom editorial navy) | consultivo |

### 2.2 PL1 — Intake das personas (retroativo)

Cada agent acima tem perfil canônico em `farpa-reengenharia/07-personas/`. Memória específica do produto Forte a ser materializada em `99-memoria/<persona>/forte-farpa-ai/` por agent ativo — **gap atual** → M6.

### 2.3 Gaps identificados pelo CHRO que podem exigir P17

- **Especialista CREF** — útil para revisão de texto de marketing e de anamnese padrão. Recomendação: Trilha C (humano externo pontual) antes de ultrapassar 50 PTs ativos.
- **DPO humano certificado** — atual é persona sintética (Super Contratos & IP G2). Escala com dados sensíveis sugere Trilha C em D+90.

---

## 3. Seção CFO G4 Fornecedores — Vendor Inventory Inicial

### 3.1 Vendors novos introduzidos pelo Forte

| Vendor | Serviço | Tier proposto | Processa PII? | Sensíveis? | DPA? |
|---|---|---|---|---|---|
| Cloudflare Workers AI | inferência LLM Tier 1 | Tier 1 | Sim (prompts pós-redact) | Potencial | Verificar em F6.5 |
| Cloudflare Email Workers | envio de notificações | Tier 2 | Sim (email, nome) | Não | Verificar em F6.5 |
| Google Gemini API | inferência LLM Tier 2 fallback | Tier 1 | Sim (prompts pós-redact) | Potencial | Google Cloud DPA — confirmar vinculação |
| Cloudflare D1/KV/R2/Queues | dados estruturados + exports | Tier 1 | Sim | **Sim — anamnese, medições** | Verificar em F6.5 |

### 3.2 Scoring 3D preliminar (P23)

| Vendor | Criticidade | Acesso a dados | Exposição financeira | Score | Tier |
|---|---|---|---|---|---|
| Cloudflare (D1/KV/R2/Queues) | 3 | 3 | 1 | **9** | **Tier 1 — DPA obrigatório** |
| Cloudflare Workers AI | 2 | 2 | 1 | 4 | Tier 2 |
| Cloudflare Email Workers | 2 | 2 | 1 | 4 | Tier 2 |
| Google Gemini | 2 | 2 | 1 | 4 | Tier 2 |

**Observação CLO:** Cloudflare armazena dados de saúde (sensíveis) → DPA Tier 1 é **mandatório pré-escala**, mesmo com score 9 tendo componente financeiro baixo. Decisão remete ao ADR 021 do ecossistema (Cloudflare Tier 2 + DPA obrigatório Health/Fintech) — Forte se beneficia automaticamente da política Health e deve ser incluído no contrato.

### 3.3 Gaps abertos para F6.5

- Assinatura/verificação de DPA Cloudflare aplicável ao Forte (R4 de F6.5).
- Confirmação contratual do Google Cloud DPA para Gemini API.
- Termo de processamento específico para Cloudflare Email Workers.

---

## 4. Mitigadores (M1–M6) — gates para aprovação condicional

| ID | Descrição | Dono | Prazo | Bloqueante? |
|---|---|---|---|---|
| M1 | Publicar email DPO `dpo@farpa.ai` + página `/privacidade` com encarregado nomeado | CLO G2 + Super Infra | D+7 | Sim (antes do 10º aluno) |
| M2 | Onboarding do aluno (E3) com 4 opt-ins granulares + registro D1 `consents` | Super Frontend + Super Backend | D+14 | Sim (antes de coletar anamnese de novo aluno) |
| M3 | Fluxo `/me/excluir` com preservação Art. 16 (logs fiscais 5 anos) | Super Backend + CLO | D+30 | Não (recomendado) |
| M4 | Cron de retenção: purge de anamnese/medições inativas > 5 anos | Super Backend | D+60 | Não (ainda não há dado elegível) |
| M5 | Disclaimer bilíngue nas 3 superfícies (app aluno footer · output IA PT · landing) | Super Frontend + CMO | D+3 | **Sim (go-live)** |
| M6 | Materializar memória Forte em `99-memoria/<agent>/forte-farpa-ai/` para 12 agents ativos | Orquestrador + CHRO | D+14 | Não |

---

## 5. Veredito consolidado F2.5

| Dimensão | Parecer |
|---|---|
| LGPD | **Aprovado com ressalvas** · M1/M2 bloqueantes fracos |
| CFM/CREF | **Aprovado** · gate `pt_reviewed` suficiente + M5 no marketing |
| AI Governance (P22) | **Aprovado — Risco Limited** · logging obrigatório |
| Vendors preliminares | **Condicionado à F6.5** (DPA Cloudflare) |
| Personas/PL1 | **Aprovado** · M6 aberto como follow-up |

**Recomendação ao Founder:** prosseguir com go-live monitorado **após M5 implementado (D+3)** e M1/M2 em até D+14. M3/M4/M6 seguem como follow-ups sem travar operação.

**Assinaturas institucionais:** CLO (super-regulatorio-setorial) · CHRO (super-talent-development) · CFO G4 (super-controladoria) · Orquestrador — 2026-04-19.

---

*farpa Forte · 02b-charter · v1.0 · 2026-04-19 · F2.5 retroativa · P26 · ADR 018 vigente · bilingual PT-BR + EN no disclaimer*
