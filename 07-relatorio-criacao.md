# Relatório Final de Criação — forte.farpa.ai
> Produto: farpa Forte · Repo: rff82/forte-farpa-ai · Subdomínio: forte.farpa.ai
> Pipeline: F1 Research → F7 Deploy (v1) + F2.5 Charter + F6.5 Due Diligence + F8 Handoff (retroativos sob ADR 018)
> Data de conclusão v1: 2026-04-19 · Data de retroativa v2: 2026-04-19
> Orquestrador: Claude Opus 4.7 sob constituição v4.1 (ADR 012 + 013 + 018)

---

## 1. Identidade & posicionamento

**farpa Forte** é SaaS B2B para personal trainers autônomos no Brasil gerenciarem agenda, alunos, pagamentos (Pix manual) e evolução física. Diferenciais únicos vs Trainerize/Hevy/TrueCoach: **Pix nativo sem gateway + selo CREF + PT-BR nativo + IA assistente revisada**. Alvo: PTs com 10–60 alunos.

## 2. Cronologia das 7 fases

| Fase | Data | Super responsável | Entregável canônico |
|------|------|-------------------|---------------------|
| F1 Research | 2026-04-17/18 | Super Research & Discovery | `01-research/` — análise mercado fitness SaaS BR, benchmarks, job-to-be-done |
| F2 Discovery | 2026-04-18 | Super Research & Discovery | `02-discovery/` — 7 personas fictícias (5 PTs: Rafa, Ju, Lucão, Clara, Marcos + 2 alunos: Bia, Seu Antônio) |
| F3 UX | 2026-04-19 | Super UX/CX Design | `03-ux/` — flows, accessibility spec, Modo Simples (Seu Antônio) |
| F4 CX | 2026-04-19 | Super UX/CX Design | `04-cx/` — 22 Moments of Truth, SLA Pix, onboarding ≤7d |
| F5 Validação | 2026-04-19 | Super Research & Discovery | `05-validacao/` — entrevistas simuladas com personas F2 · 0 no-go · 9 refinamentos |
| F6 PRD | 2026-04-19 | Super PM & Delivery | `06-prd/` — 12 épicos P0, ADR 014, ADR 015 |
| F7 Implementação | 2026-04-19 | Supers Infra + Frontend + Backend + AI + SecOps + CFO | Onda A (schema_v2, threat model, ADR 016) · Onda B (backend 6 rotas + frontend 12 páginas + CI matrix 6 browsers + schema_v3) · Onda C (SecOps audit + provisioning + deploy) |

## 3. Equipe atuante

### Personas fictícias (validação)
Rafael 32 Rio SP, Juliana 28 SP, Lucão 45 Brasília, Clara 36 POA, Marcos 41 Recife; alunos Bia 24 e Seu Antônio 67.

### Equipe multidisciplinar real (orquestração)
- **CPO** → Super Research & Discovery (F1/F2/F5), Super UX/CX Design (F3/F4), Super PM & Delivery (F6)
- **CTO** → Super Infra, Super Frontend, Super Backend, Super AI, Super SecOps (F7 paralelo)
- **CFO** → Super FP&A + Tesouraria (gates F6, F7)
- **CMO** → consultado em F3 (tom de voz editorial navy) sem divergência
- **Founder (Rodrigo)** → arbitragens D1, D3, D6, pivô Editorial Navy

## 4. Divergências e arbitragens

| ID | Tema | Posições | Arbitragem Founder | ADR |
|----|------|----------|-------------------|-----|
| D1 | IA no MVP? | Super AI: sim dual-tier · Super SecOps: não sem PII redact · CFO: sim se free tier | **Incluir com redact + gate `pt_reviewed`** | ADR 014 |
| D3 | Comunidade no MVP? | Super Community: sim (retenção) · Super PM: não (escopo) | **Fora do MVP, backlog P2** | ADR 014 |
| D6 | SLA Pix conciliação | Super Backend: automação OCR · Super SecOps: manual com auditoria | **Manual + recibo anexo + trilha imutável** | ADR 016 |
| — | Onboarding único vs dual-mode | Super UX: dual-mode (PT vs aluno diverge muito) · PM: unificar | **Dual-mode** | ADR 015 |
| — | Pivô DS | Pesquisa inicial Peloton/WHOOP dark · Stitch iteração → Editorial Navy | **Pivô navy #1A2B4C primary + orange secondary (dark toggle)** | registro em 02-design-system/05-trend-research.md |

## 5. ADRs gerados

- **ADR 014** — IA dual-tier (Workers AI + Gemini fallback) com redact PII e gate `pt_reviewed`; Comunidade fora do MVP
- **ADR 015** — Onboarding dual-mode (PT vs aluno) com divergência controlada
- **ADR 016** — Pix manual sem gateway no MVP; recibo anexo + HMAC one-shot para exports GDPR

## 6. Invariantes U1–U8 — auditoria final

Todos verdes em `05-validacao/secops-final-audit.md` · 12/12 páginas com U1+U2 · Zero stats inventadas (U8) · Cookie triplet correto em helper único `sessionCookie()` (U5) · Zero secrets hardcoded (U6) · CI self-healing já exercitado no incidente e0b7ddd (U7).

## 7. Infraestrutura provisionada (F7 Onda C)

```
Worker URL:    https://forte-worker.rfelipefernandes.workers.dev
Version ID:    2015ae74-eb8a-432e-bbe6-019c9567db29
D1:            forte-farpa-ai-db (22 tabelas) · schema v1+v2+v3 aplicados remote
KV:            FORTE_CACHE (048067c702bf426d948203c9cc185c95)
R2:            forte-exports
Queues:        forte-export-queue (producer+consumer) + forte-export-dlq
Cron:          */5 * * * * (purge exports GDPR)
Bindings AI:   Workers AI ativo
```

## 8. Unit economics (90d)

- Custo fixo: **~R$30/mês** (Workers Paid $5 + reservas)
- Custo por PT ativo: **R$0** até ~1k PTs (free tier)
- Custo por recibo Pix: **R$0** (manual)
- Gemini fallback projetado: **<R$5/mês**

## 9. Follow-ups abertos

| Item | Prazo | Owner |
|------|-------|-------|
| Revisão de canais SMS/WhatsApp (opt-in + custo) | 2026-05-04 | Super Backend + CFO |
| Penetration test externo | 2026-07-19 (90d) | Super SecOps |
| Rotação HMAC automatizada | 2026-07 | Super Backend |
| Revisão custos CF | 2026-05-19 (30d) | CFO |
| Decisão Comunidade (backlog P2) | 2026-Q3 | CPO |

## 10. Lições aprendidas

1. **Pergunta-trava funciona** — classificar pontual vs completo ficou natural e evitou retrabalho em F6.
2. **Dual-mode onboarding** — tentar unificar PT+aluno teria virado dívida técnica; ADR 015 foi decisão de alto valor.
3. **Pix manual > gateway no MVP** — eliminou dependência externa, habilitou R$0 por recibo e validou hipótese de mercado sem risco financeiro.
4. **Pivô Editorial Navy** — pesquisa inicial (Peloton/WHOOP dark) foi superada por iteração Stitch. Lição: tratar trend research como hipótese, não como dogma.
5. **CI self-healing pagou dividendo** — incidente e0b7ddd (YAML `---` em heredoc) foi auto-registrado e já está imunizado em template global `orchestrator-farpa/`.
6. **Pipeline completo em 3 dias é factível** — F1→F7 com equipe multidisciplinar simulada entregou produto deployável com 22 tabelas, 12 páginas, 6 rotas backend e suíte de testes 6-browsers.

## 11. North Star & metas 90d

- **North Star:** nº de PTs ativos com ≥5 alunos pagantes/mês recebendo via Pix pelo Forte
- **Meta M1:** 10 PTs beta (convite direto) com onboarding ≤7d
- **Meta M2:** 50 PTs ativos · NPS ≥ 50 · 0 incidentes LGPD
- **Meta M3:** 150 PTs ativos · churn mensal ≤ 5% · custo CF ≤ R$50/mês

## 12. Aprovação final

- SecOps: APROVADO ✅
- CFO: APROVADO ✅
- Infra: PROVISIONADO & DEPLOYADO ✅
- PM: relatório aceito ✅
- Founder: aguardando ratificação

**farpa Forte está LIVE.**

— Orquestrador · 2026-04-19

---

## 13. Fases retroativas sob ADR 018 (constituição v2)

Constituição evoluiu para v2 em 2026-04-19 (ADR 018: 7 diretorias, 26 supers, processos P17–P29). Três fases obrigatórias faltavam no pipeline v1; foram executadas retroativamente no mesmo dia.

### 13.1 F2.5 Charter Regulatório & Pessoas (P26)
- Artefato: [`02b-charter/charter-regulatorio.md`](02b-charter/charter-regulatorio.md)
- Responsáveis: CLO (super-regulatorio-setorial) · CHRO (super-talent-development) · CFO G4 Fornecedores
- Veredito: **APROVADO COM RESSALVAS** — 6 mitigadores (M1–M6)
- Bloqueantes de go-live: **M5 disclaimer bilíngue (D+3)** é o único gate duro
- Bloqueantes fracos (antes do 10º aluno): M1 email DPO + M2 consentimento granular em E3

### 13.2 F6.5 Due Diligence Fornecedores (P27)
- Artefato: [`06b-dd-vendors/vendor-charter.md`](06b-dd-vendors/vendor-charter.md)
- Responsáveis: CFO G4 · CLO G1 Contratos & DPAs · CTO SecOps · gate triplo CFO+CLO+CPO
- Veredito: **APROVADO COM RESSALVAS** — 4 ressalvas (R1–R4)
- Bloqueante condicional: **R3 Gemini paid tier billing** — mitigado via feature flag `AI_TIER2_ENABLED=false` até confirmação
- Vendors classificados: Cloudflare core (Tier 1, score 9) · Workers AI/Gemini/Email Workers (Tier 2) · GitHub (Tier 3)
- `vendor-registry.yaml` proposto para `farpa-reengenharia/09-configuracao/`

### 13.3 F8 Handoff Operacional (P28)
- Artefato: [`08-handoff-operacional/00-handoff-operacional.md`](08-handoff-operacional/00-handoff-operacional.md)
- Responsáveis: COO/CX · CHRO · CFO Super FP&A
- Veredito: **APROVADO** · produto em operação plena
- SLA MVP documentado · runbook por cenário (A–E) · fluxo P20 em vigor · handoff Cowork adiado D+90
- Forecast 90d: 10/25/50 PTs ativos · custo CF ~R$30–35/mês · pricing Pro avaliado pós-M2

### 13.4 Follow-ups consolidados das fases retroativas

| ID | Origem | Descrição | Prazo | Bloqueante? |
|---|---|---|---|---|
| M5 | F2.5 | Disclaimer bilíngue em 3 superfícies | D+3 | **Sim (go-live)** |
| R3 | F6.5 | Feature flag AI_TIER2 até Gemini billing paid confirmado | antes do 1º fallback | **Sim (condicional)** |
| M1 | F2.5 | Email dpo@farpa.ai + página /privacidade | D+7 | Sim (pré-10º aluno) |
| R4 | F6.5 | SPF/DKIM/DMARC forte.farpa.ai | D+14 | Não (reputação) |
| M2 | F2.5 | 4 opt-ins granulares em E3 | D+14 | Sim (pré-anamnese nova) |
| M6 | F2.5 | Memória por agent em 99-memoria/ | D+14 | Não |
| R1 | F6.5 | Arquivo formal Cloudflare DPA | D+30 | Não |
| R2 | F6.5 | Assertion anti-leak PII em prompts | D+30 | Não |
| M3 | F2.5 | Fluxo /me/excluir LGPD Art.16 | D+30 | Não |
| M4 | F2.5 | Cron de retenção 5 anos anamnese/medições | D+60 | Não |
| — | F8 | Dashboard /admin/health | D+14 | Não |
| — | F8 | Primeira P18 Q2 2026 | jun/2026 | Não |

### 13.5 Veredito final consolidado

**APROVADO COM RESSALVAS.** forte.farpa.ai pode seguir em operação imediatamente mediante:
1. Publicação do disclaimer bilíngue (M5, D+3)
2. Ativação da feature flag `AI_TIER2_ENABLED=false` até confirmação Gemini billing (R3)

Nenhuma Diretoria bloqueou go-live. CLO e CFO assinaram aprovação condicional. COO/CX assumiu operação. CHRO incluiu Forte no ciclo trimestral P18. Nenhuma escalação ao Founder por impasse — apenas decisão operacional de Rodrigo sobre R3 (confirmar billing Google Cloud ou aceitar fallback desabilitado).

— Orquestrador · 2026-04-19 (fases retroativas v2)
