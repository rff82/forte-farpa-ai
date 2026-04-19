# F4 · CX — Onboarding Humano do PT · farpa Forte
> Do primeiro contato ao 1º aluno cadastrado · 2026-04-19 · bilingual PT-BR + EN

---

## 0. Definição

"Onboarding humano" = a jornada do PT desde o primeiro toque com a marca até o **momento em que cadastra o primeiro aluno e envia o primeiro treino**. É o **MoT P0.3** e o alvo central da Fase 2 Ativação do blueprint.

Meta de sucesso mensurável (review ADR 014 em 60d):
- **≥ 60% dos PTs** que completam cadastro chegam ao 1º treino enviado em **≤ 7 dias**.
- Dentro dos que chegam, **≥ 70%** em **≤ 1h da primeira sessão** (onboarding completo in-session).

---

## 1. Mapa de toques

```
T0  Descoberta (conteúdo orgânico, indicação, busca)
T1  Landing forte.farpa.ai  (U1 toggle PT/EN · U2 alto contraste)
T2  Cadastro (OAuth via admin.farpa.ai · U5)
T3  Onboarding em 6 passos (F3 §1.1)
T4  Dashboard vazio — estado zero projetado (empty state guiado)
T5  Primeiro aluno (anamnese 3 etapas)
T6  Primeiro treino (manual OU sugestão IA opt-in)
T7  Envio do treino ao aluno (WhatsApp + link)
T8  Primeira sessão realizada (marcada pelo PT)
T9  Check-in farpa D+2 (email opcional · não invasivo)
T10 Primeira cobrança Pix (geralmente D+7 a D+30 · fecha o loop)
```

---

## 2. T1 Landing — objetivos & elementos

**Objetivo singular:** fazer PT em dúvida testar grátis em ≤ 60s.

Elementos obrigatórios:
- **Hero** com headline bilingue (U1 alternável) — DS Editorial Navy Performance, tipografia Lexend.
- **Toggle alto contraste** sempre visível no header (U2).
- **Mockup real** da tela "1º treino" — zero stat inventada (U8).
- **CTA primário**: "Grátis, sem cartão" → leva direto a OAuth.
- **CTA secundário**: "Ver como funciona em 90s" → vídeo curto (roteiro em F6).
- **Seção de confiança honesta**: "MVP · gratuito agora · planos pagos em Q3/2026" — sem asterisco.
- **Rodapé**: link acessibilidade, suporte, termos, LGPD, status page.

Anti-padrões proibidos (U8 + ethos):
- Depoimentos fictícios sem marcação clara.
- Números de alunos/PTs inventados.
- "Mais de 1.000 treinadores confiam" quando temos 0.

---

## 3. T2 Cadastro — handoff admin.farpa.ai

Reutiliza IdP central. Checklist:
- Cookie `forte_sid` `SameSite=None; Secure; Partitioned` (U5 — incidente 2026-04-18 não se repete).
- Opções: Google OAuth · Email com magic link.
- Tela de consentimento mínimo: termos + LGPD · CREF **não é exigido nessa etapa** (dealbreaker P3 Lucão em transição).
- Pós-cadastro → tela intermediária "Bem-vindo! Vamos configurar em 3 minutos" → T3.

---

## 4. T3 Onboarding em 6 passos (canônico F3)

Reforços CX sobre o fluxo UX:

| Passo | Tempo alvo | Gatilho afetivo | Guardrail |
|---|---|---|---|
| 1 Boas-vindas | 20s | "Vamos começar pelo básico" · microcopy empática | Barra de progresso presente |
| 2 Escopo (academia/condomínio/casa/híbrido) | 30s | Usado para personalizar próximos telas | Multi-select ok |
| 3 Primeiro aluno (skip) | 60s ou skip | CTA dual: "Cadastrar meu 1º aluno agora" vs "Pulo essa parte" | Skip permitido · P2 Ju às vezes cadastra do computador à noite |
| 4 Política IA | 20s | Explica em 1 frase — "Nós sugerimos, você sempre edita" · opt-in default ON | **Sem skip** (decisão consciente) |
| 5 Política comunidade | 20s | "Você pode ligar depois — default desligado" | **Default OFF** (ADR 014) · skip permitido |
| 6 Pronto | 10s | Celebração discreta · CTA "Ir pro dashboard" | — |

**Microcopy em PT-BR de referência (EN paridade):**
- Passo 4: "A IA sugere treinos e anamneses — você sempre edita antes de mandar pro aluno. Nada sai no seu nome sem você ler."
- Passo 5: "Comunidade entre seus alunos fica desligada. Se um dia fizer sentido, você liga no painel."

---

## 5. T4 Dashboard vazio — estado zero guiado

Empty state é **o momento de maior abandono silencioso** em produtos B2B SaaS. Tratamos como página de produto, não como erro.

Layout:
- Header com "Bem-vindo, {primeiro nome}" · toggle contraste · seletor idioma
- **3 cards de próximos passos**, em ordem:
  1. "Cadastre seu primeiro aluno" — CTA primário (se não fez no T3)
  2. "Conecte seu Pix" — secundário (abre assistente T10)
  3. "Explore com um aluno-exemplo" — cria aluno fictício descartável em 1 clique (permite brincar com a ferramenta sem dados reais)
- Tour guiado opcional de 4 passos (não bloqueante)
- Link "Falar com a gente" discreto mas presente

**Regra:** dashboard nunca mostra gráficos vazios · nunca mostra "0 alunos" em destaque. Trocamos por estado convidativo.

---

## 6. T5 Primeiro aluno — anamnese em 3 etapas

Reforços CX:
- Etapa 1 (dados básicos): ≤ 6 campos essenciais · CPF opcional · foto opcional.
- Etapa 2 (PARQ/histórico de saúde): checklist · perguntas de saúde estruturadas · campo livre para observação.
- Etapa 3 (objetivo + foto inicial opcional): texto aberto do objetivo do aluno · fotos in-place (R2 com acesso restrito).

**Tempos alvo:** 3–5 minutos total.

**Opção power-user (P1, P3):** "Cadastro rápido" que só exige nome + WhatsApp + objetivo (anamnese fica `draft` e farpa lembra depois).

**Guardrail ADR 014 G1:** treino via IA **não liga** se anamnese está em `draft`. Mensagem clara "Complete a anamnese para usar IA — ou crie treino manual agora".

---

## 7. T6 Primeiro treino — momento mágico

Dois caminhos, decididos pelo PT:

### 7.1 Caminho manual
```
[Editor de treino]
  - Estrutura: dias · exercícios · séries/reps/carga/descanso/observação
  - Biblioteca de exercícios (seed ~200 exercícios comuns BR + vídeos curtos opcionais)
  - Salvar · {Enviar para aluno}
```

### 7.2 Caminho IA (opt-in)
```
[Editor de treino]
  └─ {Sugerir com IA}
       ⚙ lê anamnese + objetivo + escopo (condomínio/academia/casa)
       ⚙ chama Gemini (U6 secret) · Tier 2 ADR 011
       ⚙ hash(prompt) em KV — se já gerado nos últimos 7d, reusa (custo)
       → [Rascunho com badge "IA · revise antes de enviar"]
            - diff visual se o PT editar
            - campo obrigatório "Observação do PT" (força humanização)
            → {Salvar como meu treino}
```

**Microcopy de humildade da IA:**
- "Sugestão para {aluno}. Revise cargas, volumes e contraindicações — você conhece melhor."
- "Se a sugestão não fizer sentido, descarta e escreve do seu jeito — a gente aprende."

---

## 8. T7 Envio ao aluno

Três opções (sempre explicit action · nunca auto):
1. **WhatsApp** — wa.me com link curto R2 + texto PT/EN.
2. **Copiar link** — KV short-link 90d.
3. **Imprimir PDF** — útil para A2 Seu Antônio via P2 Ju.

Confirmação em tela "Treino enviado para {aluno} via {canal}" + timestamp no perfil do aluno.

---

## 9. T8 Primeira sessão realizada

Objetivo: capturar o momento em que o PT percebe valor.

- Push ao PT 2h após horário da sessão: "Como foi o treino com {aluno}?"
- CTA 1 clique: "Feito" · "Não aconteceu" · "Marcar depois"
- Se "Feito" → pequena celebração ("Primeiro treino registrado — parabéns") + convite discreto "Que tal o próximo passo: configurar Pix?"

---

## 10. T9 Check-in farpa D+2 (humano-assistido)

Email automatizado com cara humana do fundador (não "no-reply"):
- Assunto: "Como foi seu início no farpa Forte?"
- Corpo: 3 linhas · pergunta aberta · link para FAQ + contato direto
- Remetente: email monitorado por humano na janela útil
- Opt-out no rodapé

**Nunca** push/SMS para esse check-in — seria invasivo.

---

## 11. T10 Primeira cobrança Pix

Quando PT tenta criar 1ª cobrança e não configurou Pix ainda:
```
[Assistente Pix]
  1. Escolha do PSP (1 no MVP · multi pós-MVP)
  2. Inserir chave Pix (CPF · CNPJ · email · telefone · aleatória)
  3. Validar CREF + CNPJ/MEI (bloqueador só para recibo automático)
  4. Teste de cobrança R$ 0,01 para si mesmo (opcional · recomendado)
  5. Pronto · volta ao fluxo original de cobrar o aluno
```

Se PT não tem CNPJ/MEI: recibo automático fica desabilitado com copy clara "Você pode cobrar agora mesmo — recibo automático exige CNPJ/MEI. Posso usar recibo manual simples como pessoa física." (link para docs).

---

## 12. Trilhas de ativação por persona

| Persona | T3 skip 3? | T4 usa aluno-exemplo? | T6 prefere IA? | Meta dias até 1º treino enviado |
|---|---|---|---|---|
| P1 Rafa | Não (cadastra já) | Não | Sim (sugestão) | 1–2 dias |
| P2 Ju | Sim (à noite) | Não | Só para novato · com edição forte | 2–3 dias |
| P3 Lucão | Sim | Sim (brinca primeiro) | Sim (heavy) | Mesmo dia |
| P4 Clara | Sim | Sim | Sim com tom premium | 2–4 dias |
| P5 Marcos | Não | Sim (avalia) | Desconfiado · só com anamnese forte | 7+ dias |

---

## 13. Hooks de reativação (quando onboarding emperrou)

| Gatilho | Ação | Canal |
|---|---|---|
| Cadastrou mas não cadastrou aluno em 24h | Email "Quer que a gente te mostre um aluno-exemplo?" | Email |
| Cadastrou aluno mas não enviou treino em 3d | Push in-app "Seu aluno {nome} está esperando o 1º treino" | Push |
| Configurou tudo mas não cobrou em 30d | Email educativo "Como outros PTs cobram — 3 abordagens" | Email |
| Inativo 14d | Email aberto do fundador · pergunta o que falhou | Email |

Todos opt-outáveis · frequency cap 1/semana · nunca SMS.

---

## 14. Riscos no onboarding

| Risco | Mitigação |
|---|---|
| PT desiste no passo 4 (política IA) por medo | Copy curta · link "Por que perguntamos isso?" · permite OFF sem fricção |
| PT achar anamnese longa demais | Oferecer "cadastro rápido" · educativo sobre importância fiscal depois |
| PT testa com aluno real no dia 1 e IA falha | Badge IA · sempre editável · fallback manual sempre pronto |
| CREF ausente bloqueia demais | CREF só bloqueia recibo automático · resto da plataforma funciona |
| Acessibilidade cai durante onboarding | U2 toggle persistente em todos os 6 passos · teste a11y no CI (U7) |

---

## 15. Instrumentação (eventos)

Eventos mínimos em D1 `onboarding_events` (todos anonimizáveis para métrica):
```
landing_view · cta_start · oauth_redirect · oauth_success
onboard_step_1..6 · onboard_complete
athlete_create_start · athlete_create_complete
workout_create_start · workout_create_complete · workout_send
session_log_first
pix_setup_start · pix_setup_complete · first_charge · first_paid
```

Dashboard interno agrega funil com drop-off por passo · revisão semanal Super PM.

---

## 16. Gate review CX → F5 Validação

Antes de seguir para F5, Diretoria CPO valida:
- [ ] Service blueprint aprovado
- [ ] MoTs P0 priorizados e com dono
- [ ] Jornada de suporte operável com ferramentas MVP
- [ ] Fluxos Pix com guardrail "nunca cobrança automática"
- [ ] Onboarding humano testável em 7 dias
- [ ] Bilinguismo U1 paridade PT/EN em copy
- [ ] Acessibilidade U2/U3 presente em todos touchpoints
- [ ] U5 cookie cross-site revalidado (incidente 2026-04-18)
- [ ] Guardrails ADR 014 presentes (IA editável · comunidade default OFF)

---

*F4 · Onboarding Humano · farpa Forte · v1 · 2026-04-19*
