# F6 · PRD — farpa Forte MVP
> Super PM & Delivery · Gerência Produto + Gerência Delivery + Especialistas A (Escopo) + B (Risco) · 2026-04-19 · bilingual PT-BR + EN · v1.0
> Entrada: F1 Research · F2 Discovery (7 personas) · F3 UX · F4 CX (22 MoTs) · F5 Validação (9 refinamentos · R1-R8) · ADR 014 · ADR 015
> Saída: requisitos vinculantes para F7 Implementação (Supers Infra + Frontend + Backend + AI + SecOps)

---

## 0. Sumário executivo · Executive summary

**Produto:** forte.farpa.ai — SaaS para personal trainers autônomos (10-60 alunos) gerenciarem alunos, agenda, pagamentos Pix com CREF e evolução física com IA assistiva.

**Posicionamento MVP:** **"O único SaaS fitness BR que emite recibo Pix com CREF em ≤30s e bloqueia IA prescritiva sem anamnese assinada."** 100% grátis durante MVP · zero cartão · Pro em breve (sem pressão).

**North Star Metric:** `PTs ativos semanais` = PT que enviou ≥1 treino OU emitiu ≥1 recibo Pix nos últimos 7 dias.

**Metas MVP (90 dias pós-F7):**
- 50 PTs cadastrados · 20 ativos semanais · 100 alunos totais
- 60% dos alunos concluem onboarding em ≤7 dias (meta F4 CX)
- p50 recibo Pix ≤30s · p95 ≤2min (cold-start tolerado)
- 0 incidentes LGPD · 0 travas cross-site em Safari ITP/Firefox ETP

**Escopo vinculado:** este PRD incorpora os **9 refinamentos** da F5 Validação como requisitos P0 obrigatórios. Omiti-los = falha em P5 (dealbreaker clínico), P4 (expat bilíngue), P3 (marketing Insta).

---

## 1. Escopo MVP · MVP scope

### 1.1 Dentro do MVP (P0 · bloqueia lançamento)

| Épico | Descrição | Origem |
|---|---|---|
| **E1** Auth & Identidade | OAuth2 via admin.farpa.ai, cookie cross-site, dual-role PT/aluno | U5 · F3 · P0.2 |
| **E2** Onboarding PT | Landing grátis · signup sem cartão · primeira conta em ≤3min | P0.1 · F4 MoT P0.1 |
| **E3** Onboarding Aluno dual-mode | Modo rápido (≤5min) + modo clínico (anamnese obrigatória) | ADR 015 · R1 · P0.3 |
| **E4** Anamnese versionada | Questionário + assinatura digital + versões imutáveis | P0.6 · F3 |
| **E5** IA prescritiva gated | Geração de treino bloqueada sem `anamnesis_version_id` · audit log · edição PT | ADR 014 · P0.6 |
| **E6** Pagamentos Pix + Recibo CREF | Webhook PSP · recibo PDF ≤30s · modo informal/MEI/ME | P0.4 · R4 |
| **E7** Comunidade 3 níveis | Default OFF na conta PT · opt-in por aluno · killswitch global | ADR 014 · P0.7 |
| **E8** LGPD Export Async | Botão "Baixar tudo" · fila · ZIP CSV+PDF+JSON · email de conclusão | P0.5 · R6 |
| **E9** Demo pública | Rota `/c/{slug}/demo-treino` com watermark não-prescritivo | R5 · P0.6 |
| **E10** Bilinguismo PT+EN | Nativo em todos os fluxos PT e aluno (U1) | U1 · P4 Clara |
| **E11** Acessibilidade | Toggle alto contraste (U2) · WCAG AA (U3) · modo simples aluno idoso (A2) | U2 · U3 · F3 a11y |
| **E12** CI self-healing + Matrix browsers | Teste automatizado Safari/Firefox/Chrome/Edge + log de falhas | U7 · R3 |

### 1.2 Fora do MVP (P1 · backlog priorizado)

- Invoice EN+USD (R2 · Clara)
- Plano Pro com tiers (R7 · CMO aprovar copy no MVP, mas cobrança só pós-MVP)
- Apps nativos iOS/Android (MVP é PWA mobile-first)
- Integrações wearables (Strava/Garmin/Apple Health)
- Video upload de execução de exercício (só texto + GIF pré-gerado no MVP)
- Assinatura digital com ICP-Brasil (MVP usa assinatura simples com hash + timestamp)

### 1.3 Explicitamente fora (P2+)

- Loja de suplementos · marketplace · stories/reels nativos · gamificação elaborada · integração com academias (B2B2C)

---

## 2. Épicos e features (P0 MVP)

### E1 · Auth & Identidade

**Features:**
- E1.F1 Login unificado via admin.farpa.ai (OAuth2/OIDC)
- E1.F2 Cookie `forte_sid` com `HttpOnly; Secure; SameSite=None; Partitioned; Path=/`
- E1.F3 Dual-role: mesmo usuário pode ser PT e aluno em contas separadas
- E1.F4 Logout cross-site (encerra sessão em todos subdomínios farpa)
- E1.F5 Refresh silencioso se cookie expirar (fallback graceful R3)

**Critérios de aceitação:**
- AC1 Login em forte.farpa.ai persiste ao abrir admin.farpa.ai em nova aba (sem re-login)
- AC2 Matriz browsers passa: Safari iOS ITP · Firefox ETP · Chrome Incognito · Edge · Chrome Android
- AC3 Se cookie morrer por ITP/ETP, UI mostra "sessão expirada" e re-autentica sem perder contexto
- AC4 Incidente 2026-04-18 (SameSite=Lax) não pode regredir — teste de regressão no CI

**Dependências:** admin.farpa.ai IdP funcional · Super Backend + SecOps

---

### E2 · Onboarding PT

**Features:**
- E2.F1 Landing com copy "100% grátis no MVP · sem cartão · Pro em breve" acima da dobra
- E2.F2 Signup: email + senha + CREF (opcional mas recomendado) + estado fiscal (`informal | mei | me`)
- E2.F3 Dashboard vazio com CTA "Cadastrar primeiro aluno" como único caminho
- E2.F4 Toggle "compliance clínico" em `/conta/configuracoes` (força modo clínico global · ADR 015)

**Critérios de aceitação:**
- AC1 Nenhum campo de cartão em nenhum passo
- AC2 Copy "Pro em breve" revisado e aprovado por CMO antes de deploy (R7)
- AC3 Signup completo em ≤3min cronometrado (persona Rafa)
- AC4 Estado fiscal é obrigatório no signup (pré-condição de E6)

---

### E3 · Onboarding Aluno dual-mode (ADR 015)

**Features:**
- E3.F1 **Modo rápido (default):** PT clica "Novo aluno" → nome + email + objetivo → IA gera esqueleto → PT revisa → envia. Meta ≤5min. Anamnese fica pendente no aluno (notificação para responder depois).
- E3.F2 **Modo clínico:** PT clica "Novo aluno" → anamnese completa (30 perguntas) assinada digitalmente → só então IA libera prescrição. Meta: "draft pronto para revisão" sem SLA de 5min.
- E3.F3 Toggle `compliance_mode_forced` na conta do PT força modo clínico em 100% dos novos alunos.
- E3.F4 No modo rápido, treino gerado é marcado como `status=draft_pre_anamnesis` e aluno vê banner "responda sua anamnese para personalizar".

**Critérios de aceitação:**
- AC1 Rafa (modo rápido): click → treino enviado em ≤5min (cronometrado em teste)
- AC2 Marcos (modo clínico): não consegue enviar treino sem anamnese assinada
- AC3 Switch de modo rápido → clínico em qualquer momento preserva dados do aluno
- AC4 Audit log registra qual modo foi usado para cada aluno (LGPD + clínico)

**ADR vinculado:** **ADR 015 · Onboarding dual-mode** (ver `/farpa-reengenharia/05-adrs/015-onboarding-dual-mode-aluno.md`).

---

### E4 · Anamnese versionada

**Features:**
- E4.F1 Questionário de 30 perguntas (history · meds · lesões · objetivos · ECG · cardio flags)
- E4.F2 Versões imutáveis: editar anamnese cria nova versão, nunca sobrescreve
- E4.F3 Assinatura simples: hash SHA-256 + timestamp UTC + IP + user-agent
- E4.F4 Export da anamnese em PDF inclui todas as versões históricas (P5 Marcos)

**Critérios de aceitação:**
- AC1 Editar campo da anamnese v1 gera v2 sem perder v1
- AC2 `anamnesis_version_id` é FK obrigatório em `workout_plans` quando `status != draft_pre_anamnesis`
- AC3 PDF exportado em PT e EN (U1)

---

### E5 · IA prescritiva gated (ADR 014)

**Features:**
- E5.F1 Endpoint `POST /api/workouts/generate` exige `anamnesis_version_id` válido (exceto demo pública E9)
- E5.F2 Resposta IA é editável pelo PT antes de enviar ao aluno (guardrail ADR 014)
- E5.F3 `ai_audit_log` registra: request, response, PT edits, versão do modelo, versão da anamnese
- E5.F4 Banner permanente "AI-assisted · revisado por {PT nome}" em todo treino gerado (transparência U1)

**Critérios de aceitação:**
- AC1 Request sem `anamnesis_version_id` retorna 403 `{error: "anamnesis_required"}`
- AC2 Audit log imutável, não expõe prompts ao aluno, acessível ao PT e exportável LGPD
- AC3 PT sempre pode editar o treino antes de enviar (campo `ai_generated_raw` vs `final_plan`)

**Dependências:** Super AI (provider Tier 2 via Gemini · ADR 011) · KV cache para prompts

---

### E6 · Pagamentos Pix + Recibo CREF

**Features:**
- E6.F1 PT cadastra chave Pix + dados fiscais (CNPJ/CPF conforme `pt_fiscal_status`)
- E6.F2 Gera cobrança Pix para aluno via PSP (a definir em F7 — candidatos: Efí, Asaas, Stripe-Pix)
- E6.F3 Webhook `POST /api/pix/webhook` assinado · gera recibo PDF em `queue` dedicado
- E6.F4 Recibo contém: CREF, nome PT, CNPJ/MEI OU "PT informal em transição" (R4), txid, valor, aluno, data/hora, assinatura hash
- E6.F5 Email transacional ao aluno com PDF anexado
- E6.F6 SLA: **p50 ≤30s · p95 ≤2min** pós-webhook (R8)

**Critérios de aceitação:**
- AC1 Recibo gerado 100% com CREF se PT tem CREF cadastrado
- AC2 Modo informal (Lucão) funciona sem CNPJ — recibo diz "PT autônomo · CREF XXX"
- AC3 Cold-start Worker não ultrapassa p95 de 2min — medição contínua no Analytics
- AC4 Webhook reentrante é idempotente (mesmo txid não gera recibo duplicado)

**Dependências:** Super Backend + Super Infra (Cloudflare Queues ou DO) + CFO (due diligence PSP)

---

### E7 · Comunidade 3 níveis

**Features:**
- E7.F1 **Nível 1 Conta PT:** `community_enabled` default `false`. PT pode ligar global em `/conta/comunidade`.
- E7.F2 **Nível 2 Aluno:** mesmo com PT ON, cada aluno recebe no onboarding "quer participar da comunidade? [sim] [não]" · default não
- E7.F3 **Nível 3 Killswitch:** PT desativa globalmente a qualquer momento — remove todos alunos da comunidade sem apagar dados (reversível)
- E7.F4 UI de comunidade (mural, streak de pares, kudos) é **escondida do DOM** quando off (não só `display:none`)

**Critérios de aceitação:**
- AC1 Nova conta PT: `community_enabled = false`. Confirmado em query D1.
- AC2 Lucão pode configurar "default ON para novos alunos" mas cada aluno ainda vê prompt opt-in
- AC3 Marcos pode killswitch e nenhum dado de aluno aparece em mural em ≤5s
- AC4 Seu Antônio (A2) nunca vê UI de comunidade se não clicou opt-in

---

### E8 · LGPD Export Async

**Features:**
- E8.F1 Botão "Baixar tudo" em `/conta/privacidade` (≤2 cliques de qualquer tela)
- E8.F2 Request enfileirado (Cloudflare Queues) · worker dedicado processa e gera ZIP em R2
- E8.F3 ZIP contém: `data.csv` · `anamneses.pdf` (todas versões) · `dump.json` · `audit_log.json`
- E8.F4 Email com link R2 (signed URL válida 48h) quando pronto
- E8.F5 SLA: p50 ≤10min · p95 ≤30min (conta grande com 40+ alunos · 2 anos)

**Critérios de aceitação:**
- AC1 Export completo para conta de teste em ≤10min
- AC2 PDF de anamnese inclui todas versões históricas (P5 Marcos AC2)
- AC3 Signed URL expira em 48h e é revogável
- AC4 Export é free, ilimitado, sem gate de anti-abuse no MVP (soft limit: 1/dia/PT)

**Dependências:** Super Infra (Queues + R2) · Super SecOps (signed URLs + retenção)

---

### E9 · Demo pública (marketing Lucão)

**Features:**
- E9.F1 Rota `/c/{slug}/demo-treino` gera "treino-modelo" não-personalizado
- E9.F2 Watermark visual grande "DEMO · NÃO-PRESCRITIVO · assine anamnese para seu plano real"
- E9.F3 Rate-limit: 10 req/IP/hora (anti-abuse)
- E9.F4 CTA ao final: "Quer seu plano real? Cadastre-se grátis"

**Critérios de aceitação:**
- AC1 Demo gerada em <3s (puxar de KV cache, não chamar LLM)
- AC2 Watermark presente em 100% das exportações do demo
- AC3 Demo **nunca** usa dados reais de alunos de nenhum PT

---

### E10 · Bilinguismo PT+EN (U1)

**Features:**
- E10.F1 Seletor de idioma persistente em header (toda página)
- E10.F2 Conteúdo nativo PT e EN (não Google Translate)
- E10.F3 Recibos e anamneses exportáveis em ambos
- E10.F4 Emails transacionais no idioma do destinatário

**Critérios de aceitação:**
- AC1 Landing + app + emails 100% em ambos idiomas
- AC2 Clara consegue compartilhar recibo em EN com expat sem intervenção manual

---

### E11 · Acessibilidade

**Features:**
- E11.F1 Toggle alto contraste (#btn-alto-contraste) — navy+branco default / orange+#0A0B0D dark (U2)
- E11.F2 WCAG AA em todas páginas (contraste ≥4.5:1)
- E11.F3 Modo simples para aluno idoso (A2 Seu Antônio) — tipografia +20%, menos elementos, botões grandes
- E11.F4 Navegação por teclado completa · ARIA labels · focus-visible

**Critérios de aceitação:**
- AC1 Auditoria Lighthouse Accessibility ≥95 em todas páginas
- AC2 Seu Antônio conclui "ver treino de hoje" em ≤3 cliques no modo simples
- AC3 Rodrigo (Founder, baixa visão) valida pessoalmente o toggle antes de F7 deploy

---

### E12 · CI self-healing + Matrix browsers (R3 · U7)

**Features:**
- E12.F1 GitHub Actions testa build Pages + Worker deploy em cada push
- E12.F2 Job `browser-matrix` roda Playwright em Safari/Firefox/Chrome/Edge · cenário: login cross-site forte↔admin
- E12.F3 Job `record-failure` apenda em `## HISTÓRICO DE FALHAS DE CI` do CLAUDE.md
- E12.F4 Upload-artifact dos logs em toda falha

**Critérios de aceitação:**
- AC1 Matrix roda em todo PR que toca auth/cookies
- AC2 Falha de browser-matrix bloqueia merge em main
- AC3 Incidente 2026-04-18 tem teste de regressão vivo

---

## 3. Schema D1 — alterações necessárias

Base existente (mantém): `users · professor_profiles · student_profiles · anamneses · body_measurements · workout_plans · plan_exercises · sessions · payments`

**Alterações obrigatórias:**
```sql
ALTER TABLE professor_profiles ADD COLUMN fiscal_status TEXT
  CHECK (fiscal_status IN ('informal','mei','me')) NOT NULL DEFAULT 'informal';
ALTER TABLE professor_profiles ADD COLUMN compliance_mode_forced INTEGER NOT NULL DEFAULT 0;
ALTER TABLE professor_profiles ADD COLUMN community_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE professor_profiles ADD COLUMN community_default_on_new_students INTEGER NOT NULL DEFAULT 0;

ALTER TABLE student_profiles ADD COLUMN onboarding_mode TEXT
  CHECK (onboarding_mode IN ('rapido','clinico')) NOT NULL DEFAULT 'rapido';
ALTER TABLE student_profiles ADD COLUMN community_opt_in INTEGER NOT NULL DEFAULT 0;

ALTER TABLE anamneses ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE anamneses ADD COLUMN signature_hash TEXT;
ALTER TABLE anamneses ADD COLUMN signed_at TEXT;
ALTER TABLE anamneses ADD COLUMN signed_ip TEXT;
ALTER TABLE anamneses ADD COLUMN supersedes_id TEXT REFERENCES anamneses(id);

ALTER TABLE workout_plans ADD COLUMN anamnesis_version_id TEXT REFERENCES anamneses(id);
ALTER TABLE workout_plans ADD COLUMN status TEXT
  CHECK (status IN ('draft_pre_anamnesis','draft','sent','archived')) NOT NULL DEFAULT 'draft';
ALTER TABLE workout_plans ADD COLUMN ai_generated_raw TEXT;
ALTER TABLE workout_plans ADD COLUMN final_plan TEXT;

CREATE TABLE ai_audit_log (
  id TEXT PRIMARY KEY,
  pt_id TEXT NOT NULL,
  student_id TEXT,
  workout_plan_id TEXT,
  anamnesis_version_id TEXT,
  model_version TEXT,
  request_payload TEXT,
  response_raw TEXT,
  pt_edits TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE export_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('queued','processing','done','failed')),
  r2_key TEXT,
  signed_url_expires_at TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);
```

---

## 4. Dependências técnicas (para F7)

| Super | Responsabilidade |
|---|---|
| **Infra** | Cloudflare Queues (E6 recibo · E8 export) · R2 bucket `forte-exports` · cron de retenção · pré-warm Worker |
| **Backend** | Endpoints REST · webhook Pix idempotente · audit log imutável · signed URLs |
| **Frontend** | Dual-mode UX (E3) · toggle alto contraste (E11) · modo simples aluno · i18n (E10) |
| **AI** | Gemini (Tier 2 ADR 011) · prompts versionados em KV · guardrails gated por anamnesis |
| **SecOps** | Matrix browsers CI · cookie policy · LGPD export SLA · retenção R2 · rate-limit E9 |
| **CFO** | Due diligence PSP Pix · custo estimado Queues/R2/Workers vs Free Tier · aprovação antes de F7 |

**Sem violar Free Tier:**
- Queues: 1M msg/mês free — suficiente para 50 PTs × 20 recibos/mês × 2 jobs = 2k msgs
- R2: 10GB free — ZIP médio 5MB × 50 PTs × 1 export/mês = 250MB
- Workers: 100k req/dia — com 50 PTs ativos estamos em ~5k req/dia

---

## 5. Plano de entrega (sprints sugeridos para F7)

| Sprint | Semanas | Entregas | Gate |
|---|---|---|---|
| **S0** | W0 | Schema D1 migrado · secrets rotacionados · matrix CI rodando | CTO assina |
| **S1** | W1-W2 | E1 Auth · E2 Onboarding PT · E10 i18n base · E11 toggle | Founder valida toggle pessoalmente |
| **S2** | W3-W4 | E4 Anamnese versionada · E5 IA gated · E9 Demo pública | Super AI + SecOps review |
| **S3** | W5-W6 | E3 Dual-mode aluno · E7 Comunidade 3 níveis | Personas-teste: Rafa + Marcos |
| **S4** | W7-W8 | E6 Pix + Recibo · E8 Export LGPD async | CFO + SecOps review |
| **S5** | W9-W10 | E12 Matrix browsers · hardening · piloto fechado (Ju + Seu Antônio + Rafa + Marcos) | Relatório Final ADR 013 |

**Gate entre sprints:** review da Diretoria responsável + retrospectiva registrada em `10-sessoes/`.

---

## 6. Critérios globais de aceitação (lançamento F7)

- [ ] 7 MoTs P0 de F4 passam em teste E2E com as 7 personas simuladas reloaded
- [ ] Matrix browsers verde (Safari iOS · Firefox ETP · Chrome · Edge · Chrome Android)
- [ ] Lighthouse Accessibility ≥95 em 5 páginas chave
- [ ] Free Tier respeitado (monitoramento em `/admin` dashboard)
- [ ] 0 secret exposto (verificação `push-local.sh`)
- [ ] CLAUDE.md do produto atualizado com deploy real
- [ ] Relatório Final `07-relatorio-criacao.md` gerado (ADR 013)
- [ ] ADR 015 mergeado em `farpa-reengenharia/05-adrs/`

---

## 7. Personas × Épicos — matriz de rastreabilidade

| Persona | Épicos críticos |
|---|---|
| P1 Rafa | E2 · E3 rápido · E6 |
| P2 Ju | E4 · E5 · E7 default OFF · E8 |
| P3 Lucão | E3 rápido · E6 informal · E7 default ON opcional · E9 demo |
| P4 Clara | E10 bilíngue · E6 (invoice EN em P1) · E1 ITP |
| P5 Marcos | E3 clínico · E4 versionado · E5 gated · E7 killswitch · E8 export completo |
| A1 Bia | E7 opt-in · E10 |
| A2 Seu Antônio | E11 modo simples · E1 sessão persistente |

---

## 8. Próximos passos

1. **Orquestrador** apresenta PRD ao Founder e aguarda GO para F7.
2. Ao GO, convocar em paralelo: Super Infra · Super Frontend · Super Backend · Super AI · Super SecOps · CFO (gate).
3. Sprint S0 abre com Super Infra criando Queues + R2 e Super Backend migrando schema.
4. CMO revisa copy de monetização "Pro em breve" antes de S1 encerrar.
5. Ao final da S5, **Relatório Final de Criação de Produto** é gerado (ADR 013).

---

*farpa Forte · 06-prd · PRD principal · v1.0 · 2026-04-19 · Super PM & Delivery · bilingual PT-BR + EN*
