# F5 · Validação — Entrevistas Simuladas · farpa Forte
> Super Research & Discovery · Gerência de Avaliativo · Especialistas C (Moderador) + D (Adversarial / Skeptical)
> 2026-04-19 · bilingual PT-BR + EN · valida 7 MoTs P0 de F4 contra as 7 personas de F2
> Arbitragens herdadas: ADR 014 (IA prescritiva + Comunidade) · Invariantes U1–U8

---

## 0. Método · Method

**Objetivo:** pressionar cada MoT P0 do mapa de Momentos de Verdade (F4 §1) contra as 7 personas fictícias de F2 e emitir **go / no-go / go-condicional** por MoT, sinalizar riscos não cobertos nas fases anteriores e listar refinamentos obrigatórios antes do PRD (F6).

**Protocolo:**
- Roteiro de 30min por persona · 3 perguntas abertas + 1 fechada por MoT aplicável.
- Técnica de 5 Whys em qualquer sinal de hesitação.
- Contrafactual obrigatório — "se isso falhasse, você desistiria?" (dealbreaker test).
- Especialista C conduz · Especialista D tenta derrubar a hipótese (adversarial).
- Zero número inventado em saída pública (U8). Indicadores qualitativos expressos como `alto / médio / baixo` ou `aceita / rejeita / condicional`.

**Artefatos de entrada:**
- `01-research/` (F1 Research Brief + H1–H4)
- `02-discovery/00-personas.md` (7 personas)
- `03-ux/*` (fluxos, IA, a11y spec)
- `04-cx/01-momentos-de-verdade.md` (22 MoTs, 7 P0)
- ADR 014 (IA prescritiva + Comunidade no MVP)

**Escala de veredito por persona:**
- ✅ **Aceita** — persona confirma expectativa e não acha atrito crítico
- 🟡 **Condicional** — aceita mas exige refinamento específico
- ❌ **Rejeita** — critério objetivo não é suficiente para a persona
- ⬜ **Não-aplicável** — MoT não endereça a persona

---

## 1. Painel consolidado · Consolidated panel (7 MoTs P0 × 7 personas)

| MoT | P1 Rafa | P2 Ju | P3 Lucão | P4 Clara | P5 Marcos | A1 Bia | A2 Seu Antônio | Veredito MoT |
|---|---|---|---|---|---|---|---|---|
| **P0.1** "É grátis mesmo?" | ✅ | 🟡 | ✅ | 🟡 | ⬜ | ⬜ | ⬜ | **GO-CONDICIONAL** |
| **P0.2** Login cross-site forte↔admin | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | **GO-CONDICIONAL** |
| **P0.3** Primeiro treino ≤ 5 min | ✅ | 🟡 | ✅ | 🟡 | ❌ | ⬜ | ⬜ | **GO-CONDICIONAL** |
| **P0.4** Recibo Pix com CREF | ✅ | ✅ | 🟡 | 🟡 | ✅ | ⬜ | ⬜ | **GO-CONDICIONAL** |
| **P0.5** Exportar tudo e sair (LGPD) | 🟡 | ✅ | 🟡 | ✅ | ✅ | ⬜ | ⬜ | **GO-CONDICIONAL** |
| **P0.6** IA bloqueada sem anamnese | ✅ | ✅ | 🟡 | ✅ | ✅ | ⬜ | ⬜ | **GO** |
| **P0.7** Comunidade default OFF | ✅ | ✅ | ❌ | ✅ | ✅ | 🟡 | ✅ | **GO-CONDICIONAL** |

**Resultado agregado:** **6 MoTs P0 com go-condicional · 1 MoT P0 com go puro (P0.6)** · nenhum no-go absoluto. Refinamentos concentrados em onboarding de P5, bilinguismo real de P4, default da comunidade versus persona P3.

---

## 2. Entrevistas simuladas por MoT · Simulated interviews per MoT

### P0.1 — "É grátis mesmo?" na landing
> Persona primária: P1 Rafa · P3 Lucão · critério objetivo: copy "100% grátis no MVP" visível sem scroll · sem cartão no cadastro.

**Rafa (P1) · ✅ Aceita**
- C: "O que te faz fechar a aba de uma landing de SaaS?"
- R: "Ver *trial 14 dias* com asterisco. Eu já cliquei fora."
- C: "Aqui diz *100% grátis no MVP* acima da dobra. Convence?"
- R: "Convence. Mas preciso saber o que vira pago depois — bota um *'enquanto MVP'* que a gente entende."
- D (adversarial): "E se você cadastrar e pedirem cartão no fim?"
- R: "Aí eu saio e posto *golpe* no meu Insta."

**Ju (P2) · 🟡 Condicional**
- R: "Tudo grátis é sempre suspeito pra mim. Quero ver quem financia."
- Requer copy de transparência: "o farpa Forte é free no MVP enquanto validamos — zero dado seu vendido, zero cartão pedido."

**Lucão (P3) · ✅**
- "Se é grátis eu testo hoje à noite e posto no TikTok amanhã. Só não pode ter cartão."

**Clara (P4) · 🟡 Condicional**
- "Grátis me preocupa em produto premium — meu aluno expat associa grátis a amador. Preciso de plano pago visível ainda que opcional, só pra sinalizar que existe caminho profissional."

**Adversarial challenge (D):** "Gratuidade universal pode canibalizar WTP medido em F2 (R$ 39–249). Forte com 0 monetização no MVP arrisca modelo." → **Refinamento obrigatório:** banner discreto "plano Pro em breve · sem compromisso" aceito por CMO em F6 PRD.

**Veredito MoT:** GO-CONDICIONAL
- Add copy de transparência (Ju)
- Add menção a roadmap Pro sem pressão (Clara)
- Proibido pedir cartão em qualquer etapa do MVP (Rafa, Lucão)

---

### P0.2 — Login funciona entre forte.farpa.ai e admin.farpa.ai
> Todos os PTs · critério: cookie `forte_sid` com `SameSite=None; Secure; Partitioned`.

**Rafa (P1) · ✅** — "Se eu clicar em *minha conta* e abrir outra aba e precisar logar de novo eu desisto. Se persistir, nem percebo — que é o ponto."

**Ju (P2) · ✅** — "Tem que funcionar no Chrome do meu celular e no Safari do meu notebook. Mudo muito de dispositivo."

**Lucão (P3) · ✅** — "Se abrir da bio do Insta e cair logado, ganhou minha vida."

**Clara (P4) · 🟡** — "Com meu aluno alemão usando Firefox com *Enhanced Tracking Protection*, cookies cross-site costumam morrer. Quero confirmação que testaram nesse cenário."

**Marcos (P5) · ✅** — "Se o cookie for `HttpOnly` e `Secure`, ok. Se vazar por postMessage ou iframe, é dealbreaker LGPD."

**Bia (A1) · ✅** — "Sou user, só quero que funcione no Safari iOS com *Intelligent Tracking Prevention* ligado."

**Seu Antônio (A2) · 🟡** — "Meu neto configurou o celular uma vez. Se eu tiver que logar de novo eu ligo pra ele e paro de usar."

**Adversarial (D):** "Safari ITP e Firefox ETP marcam cookies de 3rd-party mesmo com `Partitioned`. `forte.farpa.ai` e `admin.farpa.ai` compartilham eTLD+1 (`farpa.ai`) — tecnicamente 1st-party. Mas postMessage flow do IdP pode ser tratado como cross-site. Incidente 2026-04-18 já provou `Lax` quebra." → **Refinamento obrigatório:**
- Testar matrix Safari iOS / Firefox ETP / Chrome Incognito / Edge antes de F7 deploy
- Fallback graceful: se cookie não persiste, refresh silencioso via IdP em vez de forçar login

**Veredito MoT:** GO-CONDICIONAL (matriz de browser teste obrigatória em F7).

---

### P0.3 — Primeiro treino sai em ≤ 5 minutos
> P1, P3 · critério: click "Novo aluno" → "Treino enviado" ≤ 5min cronometrado.

**Rafa (P1) · ✅** — "5 minutos pra criar aluno e mandar treino é exatamente o que eu queria. Se demorar mais, abandono no meio e o aluno nunca recebe."

**Ju (P2) · 🟡** — "Eu cadastro aluno **com anamnese séria de 30 perguntas**. 5 minutos inclui anamnese ou só esqueleto de treino? Se for só treino sem anamnese, vira ADR 014 G1 quebrada."

**Lucão (P3) · ✅** — "IA fazer esqueleto em 2min é o motivo de eu trocar de Hevy pra cá."

**Clara (P4) · 🟡** — "Preciso da versão **bilíngue** do treino. Se *5 min* vale só para PT-BR, meu expat não recebe. Quero export EN no mesmo clique."

**Marcos (P5) · ❌** — "5 minutos é velocidade de app de delivery. Meu aluno cardiopata exige anamnese + ECG anexado + reavaliação trimestral antes de treino. **Primeiro treino em 5min é clinicamente irresponsável pra meu perfil.**"

**Adversarial (D):** "P5 Marcos tem razão — o critério de 5min só vale se anamnese já foi feita OU se o treino gerado for esqueleto bloqueado até anamnese assinada. Conflito direto com P0.6."

**Refinamentos obrigatórios:**
- Dois modos de onboarding de aluno: **(a) rápido** (Rafa, Lucão — 5min, sem exigir anamnese completa para draft) · **(b) clínico** (Marcos, Ju — anamnese obrigatória antes de enviar)
- PT escolhe o modo por aluno. Default do sistema = modo rápido, mas **toggle "compliance clínico"** na conta do PT força modo B global.
- 5min mede **"click novo aluno → treino enviado para o aluno"** no modo rápido. No modo clínico, a métrica é outra (ex: "draft pronto para revisão").

**Veredito MoT:** GO-CONDICIONAL (requer refinamento para separar modo rápido vs clínico em F6 PRD).

---

### P0.4 — Recibo Pix chega com CREF e dados fiscais
> P2 Ju, P5 Marcos · critério: PDF com CREF, CNPJ/MEI, txid, valor, aluno ≤ 30s após webhook.

**Rafa (P1) · ✅** — "Recibo profissional me sobe o preço. Eu cobrava R$ 400 sem recibo; com recibo cobro R$ 500."

**Ju (P2) · ✅** — "É o que eu faço manual hoje em 1h por dia. Se automatizar, pago."

**Lucão (P3) · 🟡** — "Eu ainda sou MEI em transição. Recibo precisa funcionar com MEI **e** não-emissor. Se travar porque eu ainda não tenho CNPJ formalizado, quebra meu funil Insta."

**Clara (P4) · 🟡** — "Preciso de **invoice EN** com USD além do recibo PT-BR em BRL. Expat não aceita recibo só em português."

**Marcos (P5) · ✅** — "Se vier com CREF, txid Pix, CPF do aluno e assinatura digital, uso amanhã."

**Bia (A1) · ⬜** — Aluna; receptora do recibo. "Só quero chegar no email legível."

**Adversarial (D):** "Webhook Pix de PSP ≤ 30s é realista no 2º Pix oficial; 1º tem cold-start Worker. E onboarding fiscal de Lucão pode bloquear emissão." → **Refinamentos:**
- Modo "recibo informal" (sem CNPJ) para Lucão em transição — apenas comprovante Pix + nome PT + CREF
- Modo "invoice EN + BRL" para Clara como feature P1 (não bloqueia MVP mas precisa estar no PRD)
- SLA de 30s é meta; tolerância até 2min em primeira emissão (cold-start)

**Veredito MoT:** GO-CONDICIONAL.

---

### P0.5 — "Consigo exportar tudo e sair"
> P5 Marcos, P1 Rafa · critério: botão "Baixar tudo" gera ZIP completo em ≤ 10min.

**Rafa (P1) · 🟡** — "Legal ter, mas eu nunca vou usar **até o dia que quiser sair**. Então preciso achar o botão mesmo estressado. Não pode estar enterrado em 4 menus."

**Ju (P2) · ✅** — "LGPD é o que o síndico vai perguntar. Se eu tenho o botão, ganho contrato."

**Lucão (P3) · 🟡** — "Ok mas export **em formato que eu consiga importar em outro lugar** — CSV + PDF, não SQL."

**Clara (P4) · ✅** — "Expat exige portabilidade GDPR-compatível. Ponto."

**Marcos (P5) · ✅** — "Portabilidade LGPD art. 18. Dealbreaker.** Export precisa incluir histórico de versões de anamnese (P1.7), não só snapshot atual."

**Adversarial (D):** "ZIP ≤ 10min é desafio em conta com 40+ alunos e 2 anos de histórico. Se falhar, violamos LGPD." → **Refinamentos:**
- Export assíncrono com email de conclusão — não bloquear UI
- Formato: CSV (dados tabulares) + PDF (anamneses versionadas) + JSON (full dump)
- Botão em `/conta/privacidade` visível em ≤ 2 cliques a partir de qualquer tela
- SLA 10min é objetivo; extensível a 30min em conta grande com notificação transparente

**Veredito MoT:** GO-CONDICIONAL.

---

### P0.6 — A IA não prescreve sem anamnese assinada
> P5, P2 · critério: endpoint IA rejeita request sem `anamnesis_version_id`.

**Rafa (P1) · ✅** — "Faz sentido. Me obriga a fazer anamnese rápida antes de mandar treino. Ok."

**Ju (P2) · ✅** — "Isso é o que me convence a confiar no produto."

**Lucão (P3) · 🟡** — "Isso trava meu funil Insta: aluno clica na bio e não sai treino na hora. Entendi, mas preciso de caminho: **IA gera treino de demonstração público sem anamnese (marketing), mas prescrição real só após anamnese assinada**."

**Clara (P4) · ✅** — "Transparência AI-assisted para expat. Perfeito."

**Marcos (P5) · ✅** — "Era meu principal dealbreaker. Se funcionar, sou early adopter."

**Adversarial (D):** "Zero objeções estruturais. Apenas caminho de bypass para marketing de Lucão." → **Refinamento menor:**
- Rota pública `/c/{slug}/demo-treino` gera "treino-modelo" não-personalizado com watermark "DEMO · não-prescritivo · assine anamnese para seu plano real"
- Rota prescritiva real continua gated por `anamnesis_version_id`.

**Veredito MoT:** **GO puro** (único dos 7). Refinamento é adição, não bloqueio.

---

### P0.7 — Comunidade default OFF no nível da conta
> P2 Ju · critério: `community_opt_in=false` default; toda UI de comunidade escondida até opt-in.

**Rafa (P1) · ✅** — "Default off, eu ligo quando quiser. Perfeito."

**Ju (P2) · ✅** — "Meus idosos não podem aparecer em mural sem pedir. Default off é obrigatório."

**Lucão (P3) · ❌** — "**Aqui discordo.** Comunidade é meu diferencial. Se é off por default, vou esquecer de ligar e meus alunos não veem streak dos pares. Tira meu marketing orgânico. Quero **opção de default on na minha conta**."

**Clara (P4) · ✅** — "Opt-in granular. Perfeito para expat premium."

**Marcos (P5) · ✅** — "Quero **desativar globalmente** na minha conta. Se opt-off total existir, ok."

**Bia (A1) · 🟡** — "Como aluna, quero ver streak dos pares do Rafa. Mas o Rafa precisa ligar. Pode virar barreira — *me diz que o app tem comunidade e quando entro não tem*."

**Seu Antônio (A2) · ✅** — "Nunca quero ver comunidade. Se está off, ótimo."

**Adversarial (D):** "Divergência direta P3 ↔ P2/P5. ADR 014 já arbitrou 'default off no nível da conta do PT'. Lucão quer preferência salva no nível do PT pra ligar ON por padrão em novas contas de alunos — NÃO viola ADR 014, é refinamento de UX."

**Refinamentos obrigatórios:**
- Nível 1 — conta do PT: `community_enabled` default `false`. PT pode ativar globalmente.
- Nível 2 — aluno individual: mesmo com conta PT com comunidade ON, **cada aluno** precisa opt-in explícito no onboarding ("quer participar da comunidade? [sim] [não]"). Default = não.
- Nível 3 — PT pode desativar globalmente a qualquer momento (Marcos). Desativação retira todos os alunos sem apagar dados.
- P3 Lucão fica satisfeito com Nível 1 ON; P2 Ju / P5 Marcos ficam satisfeitos com default OFF; opt-in do aluno protege A2.

**Veredito MoT:** GO-CONDICIONAL (UX de 3 níveis precisa ser spec'd no PRD).

---

## 3. Riscos NÃO cobertos pelas fases anteriores

| # | Risco descoberto em F5 | Severidade | Fonte | Ação proposta |
|---|---|---|---|---|
| R1 | **Conflito modo rápido vs modo clínico** no onboarding de aluno (P0.3) não foi decidido em F3/F4 | Alta | Marcos (P5) vs Rafa (P1) | ADR candidato em F6: "Onboarding de aluno — dual-mode" |
| R2 | **Invoice EN + USD** (P0.4 · Clara) não estava em MoTs — emergiu só aqui | Média | Clara (P4) | Feature P1 no PRD, não bloqueia MVP mas precisa ficar no backlog |
| R3 | **Matriz de browsers para cookie cross-site** (Safari ITP · Firefox ETP) não foi testada — ADR 012/U5 implícito mas sem plano | Alta | Clara (P4) + Marcos (P5) | Teste obrigatório em F7 pré-deploy · incluir em CI self-healing (U7) |
| R4 | **Recibo modo informal** para PT MEI em transição (Lucão) não foi previsto | Média | Lucão (P3) | Adicionar estado `pt_fiscal_status=informal\|mei\|me` no schema D1 |
| R5 | **Rota pública `/c/{slug}/demo-treino`** (marketing de Lucão sem anamnese) é nova — precisa watermark + disclaimer | Média-baixa | Lucão (P3) | PRD: endpoint público gated por rate-limit + watermark |
| R6 | **Export assíncrono LGPD** precisa fila + worker dedicado — não discutido em F3 infra | Alta | Marcos (P5) | Super Infra + SecOps precisam planejar queue (Cloudflare Queues ou cron) |
| R7 | **Copy de transparência monetização** "Pro em breve · MVP 100% grátis" precisa ser aprovado por CMO antes de landing final | Baixa | Ju (P2) + Clara (P4) | Tarefa CMO no PRD |
| R8 | **SLA de 30s para recibo Pix** é agressivo em cold-start Worker | Média | Adversarial D | Ajustar SLA para 30s-p50/2min-p95 ou pré-warm |

---

## 4. Refinamentos obrigatórios antes do PRD · Mandatory refinements before F6 PRD

1. **Onboarding dual-mode (R1)** — spec explícita em F6 separando fluxo rápido de fluxo clínico com toggle por conta.
2. **3-níveis de comunidade (P0.7)** — conta PT · conta aluno · killswitch global, totalmente spec'd.
3. **Matriz de browsers + plano de fallback de cookie (P0.2/R3)** — incluir no playbook de deploy (F7).
4. **Export LGPD assíncrono (P0.5/R6)** — especificar arquitetura: Cloudflare Queues ou cron + R2 + email transacional.
5. **Modo "recibo informal" (R4)** — adicionar estado fiscal no schema antes de F6.
6. **Invoice EN+USD (R2)** — ficar no backlog P1 com estimativa de esforço.
7. **Rota pública demo-treino (R5)** — desenhar UX de watermark "DEMO não-prescritivo" em F3 suplementar OU no PRD.
8. **Copy de transparência monetização (R7)** — CMO revisa landing antes de F7.
9. **SLA recibo Pix (R8)** — reescrever como p50/p95 em vez de absoluto.

---

## 5. Divergências entre especialistas (C vs D) nesta F5

| # | C (Moderador) | D (Adversarial) | Resolução |
|---|---|---|---|
| d5.1 | "Todos os 7 P0 passaram o teste." | "P0.3 tem no-go claro da P5 — é conflito estrutural, não refinamento cosmético." | **D prevalece** em reclassificação · P0.3 vira go-condicional com ADR candidato em F6. |
| d5.2 | "Comunidade default OFF é consenso." | "P3 Lucão pode churnar se não puder pre-ativar. É diferencial competitivo perdido." | Compromisso aplicado em 3 níveis (§P0.7). |
| d5.3 | "Bilinguismo PT-BR foi suficientemente testado." | "Clara só foi pressionada em 2 MoTs. Precisamos F5.2 focada em bilinguismo antes de F6." | C prevalece parcialmente · bilinguismo é MoT P1.4 (F4), já em próximo ciclo. Marcar como re-teste no F5.2 opcional. |

Sem divergências que exijam escalada à Diretoria CPO. **CFO deve ser notificado** do R2/R7 (unit economics pós-MVP).

---

## 6. Veredito consolidado · Consolidated verdict

### Go / No-Go agregado
- **0 MoTs no-go absoluto.**
- **1 MoT go puro** (P0.6 · IA gated por anamnese).
- **6 MoTs go-condicional** com refinamentos listados em §4.
- **8 riscos novos (R1–R8)** incorporados ao backlog pré-PRD.

### Recomendação ao Orquestrador
**PROSSEGUIR para F6 PRD** com Super PM & Delivery, **desde que os 9 refinamentos de §4 sejam incorporados como requisitos vinculantes no PRD**. Sem eles, o produto falha em P5 (dealbreaker clínico), P4 (bilinguismo expat) e P3 (UX de comunidade).

### Personas prioritárias para piloto real pós-MVP
- **P2 Ju + A2 Seu Antônio** (densidade de MoTs P0 + A2 · valida U2/U3 + compliance)
- **P1 Rafa** (caso base · valida velocidade modo rápido)
- **P5 Marcos** (caso de compliance · valida modo clínico + LGPD)

### Gate review obrigatório
Antes de iniciar F6, **Diretoria CPO** revisa:
- Conflito R1 (onboarding dual-mode) — precisa de ADR?
- Riscos R3/R6 — escopo técnico suficiente para MVP ou dividir em MVP1/MVP2?

Se CPO divergir de CTO em R6 (infra async de export), **Founder arbitra** e gera ADR.

---

## 7. Handoff para F6 PRD · Handoff to F6

Entregas prontas para Super PM & Delivery consumir:
- Veredito por MoT P0 (7 decisões documentadas).
- Lista canônica de 9 refinamentos obrigatórios.
- 8 riscos novos (R1–R8) com severidade e dono proposto.
- 3 divergências C vs D resolvidas internamente — sem escalada pendente.
- Personas prioritárias para piloto pós-F7.

**Arquivos a gerar em F6 (sugestão):**
- `06-prd/00-prd.md` — PRD principal incorporando refinamentos §4
- `06-prd/01-backlog-p1-p2.md` — features adiadas (invoice EN, demo-treino, etc.)
- `06-prd/02-riscos-e-mitigacoes.md` — R1–R8 expandidos
- ADR candidato: **ADR 015 — Onboarding dual-mode (rápido vs clínico)**

---

## 8. Recomendações finais ao Orquestrador

1. **Gate review CPO** antes de iniciar F6 — foco em R1 e R6.
2. **Notificar Diretoria CFO** sobre R2 e R7 (copy de monetização Pro + invoice EN) para que FP&A precifique tiers em paralelo.
3. **Notificar Super SecOps + Super Infra** do R3 e R6 — matriz de browsers e export assíncrono.
4. **ADR candidato 015** a ser materializado em F6.
5. Próxima fase: **F6 PRD** · Super PM & Delivery · aguardar confirmação do Founder (regra "uma fase por vez").

---

*farpa Forte · 05-validacao · F5 Entrevistas Simuladas · v1.0 · 2026-04-19 · Super Research & Discovery · bilingual PT-BR + EN*
