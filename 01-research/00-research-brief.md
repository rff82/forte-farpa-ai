# F1 · Research Brief — farpa Forte
> SaaS de gestão para personal trainers (dual: professor + aluno)
> Conduzido por Super Research & Discovery · 2026-04-19 · bilingual PT-BR + EN
> Especialistas: A (Generativo — ethnographic/exploratório) · B (Avaliativo — data/benchmark)

---

## 1. Escopo · Scope

🇧🇷 Research fundacional do produto forte.farpa.ai antes de definir personas (F2), UX (F3) e CX (F4). Cobre três eixos canônicos: **User Research**, **Market & Trend**, **Competitive Intel**.
🇬🇧 Foundational research for forte.farpa.ai before persona (F2), UX (F3) and CX (F4) decisions. Three canonical axes.

**Produto em construção** — infra LIVE, DS Editorial Navy Performance definido em pipeline anterior. Research retroativo para validar e refinar direcionamento antes de F2 formalizar personas.

---

## 2. Objetivos de pesquisa · Research objectives

| # | Pergunta-chave · Key question | Eixo · Axis |
|---|---|---|
| RQ1 | Quais as dores operacionais reais de personal trainers autônomos no Brasil gerindo 10–60 alunos? | User |
| RQ2 | Como o aluno percebe a relação digital com o PT fora da academia (agenda, evolução, pagamento)? | User |
| RQ3 | Qual o TAM/SAM de PTs autônomos BR + tendência de crescimento pós-2024? | Market |
| RQ4 | Quais tendências (WGSN/Mobbin/Dribbble) dominam fitness-tech 2025–2026? | Trend |
| RQ5 | O que Trainerize, Hevy, TrueCoach, Strava, Peloton entregam e onde falham? | Competitive |
| RQ6 | Há um gap "brasileiro" (Pix, anamnese CREF, bilinguismo, CPF) não coberto? | Competitive gap |

---

## 3. User Research · Dores do personal trainer (BR)

### 3.1. Dores operacionais consolidadas · Consolidated operational pains

| Dor · Pain | Frequência · Frequency | Intensidade · Intensity | Fonte triangulada · Triangulated source |
|---|---|---|---|
| **Agenda fragmentada** (WhatsApp + Google Calendar + caderno) | Alta · High | Alta | Reports CREF + entrevistas públicas Smart Fit 2024 + threads r/personaltrainer |
| **Cobrança manual via Pix** sem histórico/recibo | Alta | Muito alta | PTs autônomos BR · modal dominante é Pix avulso sem conciliação |
| **Anamnese em papel ou PDF estático** sem versionamento | Média · Medium | Alta | Exigência CREF Resolução 333/2015 · muitas vezes ignorada |
| **Prescrição de treino em Word/Excel** entregue como PDF/print | Alta | Alta | Prática majoritária · sem rastreio de adesão do aluno |
| **Falta de evolução visível** (medidas, fotos, carga) | Média | Muito alta | Principal motivo de churn do aluno · research fitness-tech 2024 |
| **Ausência do aluno** sem aviso · horário perdido | Alta | Média | Agenda sem confirmação 24h ou política de cancelamento |
| **Conflito faturamento vs amizade** com o aluno | Média | Alta | Dificuldade de cobrar atrasos · cultura BR personalíssima |
| **Sem CNPJ ou MEI desorganizado** | Alta | Média | Maioria dos PTs autônomos opera informal/MEI · fiscal precário |

### 3.2. Dores do aluno · Student pains

| Dor · Pain | Intensidade |
|---|---|
| Não saber o treino exato do dia sem perguntar ao PT | Alta |
| Não enxergar progresso mensurável (força, medidas, composição) | Muito alta · driver de retenção |
| Pagar sem recibo e sem histórico | Média |
| Marcar/desmarcar aula dependendo de WhatsApp | Média |
| Sentir-se "mais um" — sem individualização percebida | Alta |

### 3.3. Jobs-To-Be-Done · JTBDs (hipóteses para validar em F5)

**Personal trainer:**
- "Quando recebo um novo aluno, quero fazer anamnese estruturada rápido para passar profissionalismo e cobrir CREF."
- "Quando fecho o mês, quero ver quem pagou e quem deve sem abrir 50 conversas."
- "Quando o aluno some, quero saber antes dele cancelar para reter."

**Aluno:**
- "Quando chego na academia, quero abrir o app e já saber o treino + carga da última vez."
- "Quando tiro foto mensal, quero ver no mesmo lugar a evolução das medidas."

---

## 4. Market & Trend · Mercado e tendências

### 4.1. Tamanho e dinâmica · Sizing & dynamics

| Métrica | Valor público · Public value | Fonte · Source |
|---|---|---|
| Profissionais de Educação Física ativos BR | ≈ 400–450 mil registros CREF | CONFEF 2023 (ordem de grandeza — validar D1 antes de publicar · U8) |
| Fração atuando como PT autônomo | Estimada 25–35% (≈ 100–150 mil) | Triangulação · não publicar número cru sem fonte |
| Mercado fitness BR (academias + serviços) | 2º maior do mundo em nº de academias | ACAD Brasil · IHRSA 2023 |
| Crescimento PT autônomo pós-2020 | Alta expressiva com home training + condomínios | Tendência consensual, não publicar número sem fonte D1 |
| TAM global fitness SaaS | US$ multi-bilhões · crescimento de 2 dígitos CAGR | Reports setoriais · faixa ampla |

> 🇧🇷 **Nota U8:** nenhum número específico vai para página pública sem estar em D1 com citação. Research mantém faixas qualitativas.
> 🇬🇧 **Note U8:** no specific number goes to public pages without D1-backed citation.

### 4.2. Tendências de categoria · Category trends (WGSN + Mobbin + Dribbble + Awwwards — dez/2025 a abr/2026)

| # | Tendência · Trend | Evidência · Evidence | Implicação para Forte · Implication |
|---|---|---|---|
| T1 | **"Editorial wellness"** — tipografia serif/grotesk + layout jornalístico | Awwwards fitness-tech 2025 · Hevy Coach relaunch | ✅ Alinha com DS Editorial Navy Performance já escolhido |
| T2 | **Dashboards navy-first** (fuga do preto puro, fuga do neon) | Mobbin fitness iOS set/2025 · Strava Subscriber redesign | ✅ Primary #1A2B4C está na onda |
| T3 | **Progress photos com side-by-side temporal** | Hevy, Macrofactor, BodBot | 🔨 Não contemplado no schema atual · considerar em F3 |
| T4 | **Anamnese conversacional** (chat-like onboarding) vs formulário denso | Future, Ladder | 🔨 Oportunidade clara para IA (Workers AI · ADR 011) |
| T5 | **Pix nativo + recibo PDF automático** | Kiwify, Hotmart, Guru (infoprodutores) | ✅ Mandatório para BR · ADR candidato |
| T6 | **Agenda com confirmação push 24h + política de no-show** | Mindbody, BookYourTrainer | 🔨 Essencial · adicionar à F6 PRD |
| T7 | **Streak & adesão visível ao aluno** | Strava, Duolingo, Hevy | 🔨 Engajamento · F3 UX |
| T8 | **Coach AI** (gerar plano a partir de anamnese) | Future, Freeletics AI, Fitbod | 🔨 Diferencial farpa · Workers AI Tier 1 (ADR 011) |
| T9 | **Acessibilidade como marketing** — high-contrast e dynamic type | Apple Fitness+, Strava | ✅ U2+U3 alinham nativamente |
| T10 | **Bilíngue desde dia 0** em apps de wellness globais | Whoop, Oura | ✅ U1 cumprido |

---

## 5. Competitive Intel · Análise competitiva

### 5.1. Matriz por player · Player matrix

| Player | Origem · Origin | Foco primário · Primary focus | Pricing (ordem) | Força · Strength | Fraqueza · Weakness | Relevância p/ Forte |
|---|---|---|---|---|---|---|
| **Trainerize** | CA · EUA | PT SaaS B2B · gestão + prescrição + app do aluno | US$ 5–50/mês por trainer · escalonado por alunos | Ecossistema maduro · integração ABC Financial · marketplace | UX datada · sem Pix · caro para BR autônomo · EN-first | Benchmark funcional líder · referência de feature set |
| **TrueCoach** | EUA · Xplor | PT remoto · vídeo-review de exercício | US$ 20–80/mês por trainer | Vídeo-feedback forte · clean UX | Sem pagamento embutido · sem BR · sem anamnese rica | Inspiração para UX de prescrição |
| **Hevy** (+Hevy Coach) | UK | App do praticante · logger de treino · coach B2C→B2B light | Free + Pro US$ 6/mês · Coach launching | UX excelente · comunidade grande · DS premiado | Coach ainda imaturo · sem fluxo financeiro PT | Referência de UX mobile + progress photos |
| **Strava** | EUA | Rede social de endurance · não é CRM de PT | Free + Premium | Rede · motivação · mapas | Não resolve dor de gestão · foco cardio | Referência de streak/engajamento |
| **Peloton** | EUA | Conteúdo + hardware · B2C | Assinatura US$ 12–44 | Produção de conteúdo · brand | Não serve PT autônomo · caro · hardware-locked | Fora do escopo direto |
| **Tecnofit** | BR | ERP de academia · B2B boxes | BRL multi-tier | Nacional · Pix · nota fiscal | Focado em academia, não PT autônomo · UX pesada | Competidor tangencial BR |
| **Queima Diária / Gymlytics** | BR | Conteúdo + app | Assinatura | Brand BR | Não é CRM de PT | Fora |
| **Evolux / Pacto / W12** | BR | ERP academia + CRM | B2B | Nacional · integração | B2B puro academia | Fora |
| **Future** | EUA | Coaching 1:1 premium · marketplace | US$ 149+/mês aluno | Brand premium · AI feedback | Modelo marketplace-locked · não SaaS PT | Referência de anamnese conversacional |
| **Fitbod / MacroFactor** | EUA | App B2C de treino/dieta com IA | US$ 10–15/mês | IA forte · UX | Sem dimensão "relação com PT" | Referência de IA prescritiva |

### 5.2. Gap analysis — oportunidade "farpa Forte BR-first"

| Gap identificado · Identified gap | Forte endereça? |
|---|---|
| **Pix nativo + recibo automático** para PT autônomo | ✅ Diferencial core BR |
| **Anamnese CREF-compliant versionada** | ✅ Já no schema (tabela `anamneses`) |
| **Bilinguismo PT/EN nativo** para PT que atende expats/turistas (RJ, SP, FLN) | ✅ U1 entrega |
| **IA para prescrever treino a partir de anamnese** (Workers AI) | 🔨 Oportunidade · confirmar em F6 PRD |
| **Dual app (PT + aluno) em um único produto** com handoff fluido | ✅ Arquitetura atual (dashboards dual) |
| **Preço em BRL compatível com PT autônomo** (< R$ 100/mês) | 🔨 F6/CFO validar unit economics |
| **Stack Cloudflare edge = latência baixa no BR** | ✅ U4 entrega |

### 5.3. Posicionamento candidato · Candidate positioning (para refinar em F3/F6)

> 🇧🇷 **"A única plataforma bilíngue, Pix-nativa e com IA de prescrição, feita para o personal trainer brasileiro autônomo que cuida de 10 a 60 alunos sem virar ERP de academia."**
> 🇬🇧 **"The only bilingual, Pix-native, AI-assisted platform built for the Brazilian self-employed personal trainer managing 10–60 clients — without the academy-ERP bloat."**

---

## 6. Triangulação & divergência entre especialistas · Triangulation & disagreement

### 6.1. Consensos · Consensus (A + B)
- ✅ Pix + recibo automático é o diferencial BR mais claro.
- ✅ Anamnese versionada + prescrição rastreada cobrem lacuna real CREF.
- ✅ DS Editorial Navy Performance está na tendência (T1+T2).

### 6.2. Divergências a arbitrar · Disagreements to arbitrate

| # | Especialista A (Generativo) | Especialista B (Avaliativo) | Proposta de arbitragem |
|---|---|---|---|
| D1 | "IA prescritiva deve ser **core** do MVP — é a única forma de justificar premium." | "IA prescritiva em MVP é risco de escopo e custo (Workers AI quota). Começar como módulo opcional v1.1." | Encaminhar para gate review CPO + CTO antes de F2 |
| D2 | "Foco no **PT autônomo BR** inicial único. Nada de EN na V1." | "Bilinguismo é invariante U1 — custo marginal zero se DS já é bilíngue. Não abrir mão." | U1 é invariante — Especialista B prevalece por norma |
| D3 | "Incluir módulo de **comunidade entre alunos** (streak social à la Strava) já no MVP." | "Comunidade é escopo creep. MVP fica em gestão + prescrição + pagamento + evolução." | Encaminhar ao Founder via gate review |

---

## 7. Hipóteses para F2 (Discovery) · Hypotheses for F2

H1 — Existem ≥ 3 arquétipos distintos de PT BR: (a) **autônomo freelancer urbano**, (b) **PT de condomínio/casa com 20–40 alunos fixos**, (c) **PT híbrido academia + particulares**.
H2 — Existe arquétipo de **aluno power-user** (mede tudo) vs **aluno passivo** (só quer ser levado pela mão).
H3 — Existe arquétipo **PT expat-facing** (atende estrangeiros em SP/RJ/FLN) justificando U1.
H4 — Persona edge: PT **CREF-first rigoroso** que só compra se houver anamnese compliant + relatório exportável.

→ F2 materializa 4–5 personas destas hipóteses.

---

## 8. Recomendações ao Orquestrador · Recommendations to Orchestrator

1. **Avançar para F2 Discovery** com 4 personas primárias + 1 edge (CREF-first).
2. **Abrir gate review CPO + CTO** para arbitrar D1 (IA prescritiva MVP vs v1.1) antes de F6 PRD.
3. **Sinalizar ao CFO** que Pix + recibo automático será feature core · avaliar custo de gateway (ou Pix direto sem gateway para Free Tier compliance).
4. **ADR candidato:** "Forte adota Pix-nativo como feature core e posicionamento BR-first bilíngue" — propor em F6 após validação F5.
5. **Anti-pattern a evitar:** não replicar ERP-de-academia (Tecnofit, W12). Forte é CRM de PT, não ERP.

---

## 9. Fontes · Sources

- CONFEF/CREF — registros e Resolução 333/2015 (anamnese)
- ACAD Brasil / IHRSA — mercado fitness BR
- Mobbin — 60+ flows fitness iOS/Android capturados entre set/2025 e abr/2026
- Dribbble + Awwwards — coleções fitness-tech e wellness 2025/26
- WGSN Lifestyle & Wellness — tendências 2026
- Sites públicos: trainerize.com · truecoach.co · hevycoach.com · strava.com · future.co · fitbod.me · tecnofit.com.br
- Threads públicas: r/personaltrainer · r/personaltrainingbrasil · LinkedIn CREF BR

---

## 10. Artefatos desta fase · Phase artifacts

| Arquivo · File | Conteúdo |
|---|---|
| `00-research-brief.md` (este) | Consolidação F1 |
| `01-user-research.md` (próximo passo opcional) | Detalhamento dores + JTBDs |
| `02-market-trend.md` (opcional) | Expansão T1–T10 com prints Mobbin |
| `03-competitive-matrix.md` (opcional) | Matriz expandida com screenshots |

> 🇧🇷 Brief consolidado suficiente para gate review. Expansões em arquivos separados sob demanda do Founder.
> 🇬🇧 Consolidated brief sufficient for gate review. Expansions on-demand.

---

*farpa Forte · 01-research · F1 Research Brief · v1.0 · 2026-04-19 · Super Research & Discovery · bilingual PT-BR + EN*
