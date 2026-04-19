# F4 · CX — Service Blueprint · farpa Forte
> Super UX/CX Design · Gerência Service Design · Especialistas A (Service Blueprint rigoroso) + B (Ops pragmático BR)
> 2026-04-19 · bilingual PT-BR + EN · consome F1/F2/F3 + ADR 014

---

## 0. Escopo do blueprint

Jornada de serviço fim-a-fim do PT e do aluno no farpa Forte MVP, cobrindo **5 fases de relacionamento** × **5 camadas de blueprint** (evidências físicas/digitais · ações do usuário · front-stage · back-stage · sistemas/terceiros). Bilingue U1, respeitando U2/U3/U5/U6/U7/U8 e guardrails ADR 014 (IA editável + Comunidade default OFF).

Fases:
1. **Descoberta & Aquisição** (pré-contrato)
2. **Ativação** (primeiro valor em ≤ 7 dias)
3. **Uso recorrente** (ciclo semanal)
4. **Cobrança & Financeiro** (ciclo mensal)
5. **Retenção · Suporte · Offboarding**

Personas cobertas: P1 Rafa · P2 Ju · P3 Lucão · P4 Clara · P5 Marcos (edge) · A1 Bia · A2 Seu Antônio.

---

## 1. Camadas do blueprint (definição)

| Camada | O que descreve |
|---|---|
| **Evidência** | O que o usuário vê/toca (tela, PDF, WhatsApp, recibo Pix, email) |
| **Ação do usuário** | O que PT ou aluno faz conscientemente |
| **Front-stage** | Interações diretas farpa Forte ↔ usuário (tela, notificação, copy, áudio) |
| **Back-stage** | O que acontece invisivelmente (Worker, D1, email transacional, fila) |
| **Sistemas/terceiros** | admin.farpa.ai (IdP) · Cloudflare (Pages/Workers/D1/KV/R2) · Gemini · PSP Pix · WhatsApp Business API · email |

Linha de visibilidade = entre Front-stage e Back-stage.
Linha de interação = entre Ação do usuário e Front-stage.
Linha de interação interna = entre Back-stage e Sistemas.

---

## 2. FASE 1 — Descoberta & Aquisição

> Persona-âncora: **P3 Lucão** (funil Insta) · **P1 Rafa** (busca ativa) · **P4 Clara** (indicação expat).

| Camada | Passo 1 Descoberta | Passo 2 Landing | Passo 3 Decisão | Passo 4 Cadastro |
|---|---|---|---|---|
| **Evidência** | Reel/TikTok · post Insta · indicação WhatsApp · Google | forte.farpa.ai homepage · mockup de dashboard · depoimento fictício claramente marcado (U8) | Página de preços · FAQ · comparativo vs Trainerize | Tela OAuth admin.farpa.ai · toggle alto contraste visível (U2) |
| **Ação do usuário** | Clica link na bio / vê indicação | Lê proposta, testa seletor PT/EN, ativa alto contraste se precisa | Escolhe "grátis" (MVP inteiro free) · lê política IA | Cria conta Google/Email · aceita termos |
| **Front-stage** | Conteúdo editorial Navy Performance · CTA "Grátis, sem cartão" | Hero bilingue · dados só se vierem de D1 (U8) | FAQ honesto ("MVP 100% gratuito · planos pagos 2026 Q3") | Handoff limpo para admin.farpa.ai |
| **Back-stage** | Analytics pageview · source tag (ref=insta/tiktok/ref) | Edge cache Cloudflare Pages · KV para A/B copy | Event `pricing_view` em D1 · log de opt-in IA | Worker emite cookie `forte_sid` `SameSite=None; Secure; Partitioned` (U5) |
| **Sistemas** | CDN Pages · sem tracker 3rd-party | Pages + Workers | KV A/B | admin.farpa.ai IdP · D1 `users` |

**Momento de verdade 1.1** — "Dá pra testar em PT-BR e com fonte grande?" (U1 + U2 + U3). Se falhar aqui, P2 Ju e P4 Clara descartam em 20s.

**Momento de verdade 1.2** — "É realmente grátis?" · resposta deve estar acima da dobra sem asterisco.

---

## 3. FASE 2 — Ativação (primeiro valor ≤ 7 dias)

> North-star de ativação: **PT cadastra 1º aluno + envia 1º treino + recebe 1º Pix com recibo** dentro de 7 dias.

| Camada | D0 Onboarding | D0+1h Primeiro aluno | D0+24h Primeiro treino | D0–D7 Primeiro Pix |
|---|---|---|---|---|
| **Evidência** | Onboarding 6 passos (F3 §1.1) · barra 1/6 | Form anamnese 3 etapas · link de convite | Editor de treino · botão "Sugerir com IA" (opt-in ADR 014) | Tela "Cobrar" · QR Pix · WhatsApp com recibo PDF |
| **Ação do usuário** | Informa nome, CREF opcional, escopo, política IA, política comunidade (default OFF) | Digita nome + WhatsApp do aluno · compartilha convite | Preenche ou clica "Sugerir" · revisa · salva · envia | Gera cobrança · escolhe valor · envia via WhatsApp |
| **Front-stage** | Copy curta · skip em passos não-críticos · alto contraste no header desde passo 1 | Feedback "Convite enviado" · preview do que o aluno verá · toggle "não quero agora" | Rascunho IA com badge "IA · edite antes de enviar" · diff visível | QR grande · copy-paste txid · recibo PDF com CREF do PT no cabeçalho |
| **Back-stage** | D1 `users`, `account_policies` (ai_opt_in, community_opt_in) · evento `onboard_completed` | D1 `athletes`, `anamnesis_versions` (v1) · gera `invite_token` curto · email transacional opcional | Worker AI chama Gemini (U6 secret) · hash do prompt em KV para dedupe custo · D1 `workouts` + `workout_versions` | Worker Pix chama PSP · webhook status · D1 `charges` + `receipts` · R2 guarda PDF · WhatsApp API envia link |
| **Sistemas** | admin.farpa.ai · D1 | D1 · email · link curto R2 | Gemini · D1 · KV dedupe | PSP Pix · WhatsApp Business API · R2 · D1 |

**Momentos de verdade:**
- **2.1 "A IA entendeu meu aluno?"** — se output parecer genérico, P2 Ju desativa IA na hora. Mitigação: prompt usa anamnese + objetivo declarado · nunca prescreve sem esses dois campos.
- **2.2 "O recibo tem meu CREF?"** — exigência P5 Marcos e P2 Ju. Se falhar, cancelamento no mês 1.
- **2.3 "O convite do aluno funciona no celular da tia dele?"** — A2 Seu Antônio. Link deve abrir no navegador já com alto contraste herdado se o PT tiver marcado aluno como "preferência acessibilidade".

Métrica de sucesso (ADR 014 revisão 60d): **≥ 60% dos PTs completam os 4 passos em ≤ 7 dias**.

---

## 4. FASE 3 — Uso recorrente (ciclo semanal)

> Loop central que justifica o WTP. Persona-âncora: **P1 Rafa** (28 alunos) e **P2 Ju** (42 alunos).

### 3.1 Loop do PT

| Dia da semana | Ação típica | Sistema-chave | Momento de verdade |
|---|---|---|---|
| Segunda 06h | Revê agenda semanal no celular entre sessões | D1 `sessions` · KV cache de "essa semana" | **3.1** "A agenda cabe na tela vertical sem zoom?" |
| Segunda 21h | Ajusta treinos de 5–8 alunos · usa IA para 2 novatos | Gemini (opt-in) · D1 versão | **3.2** "Consigo copiar treino do Rafa de semana passada em 2 toques?" |
| Quarta 13h | Marca sessões feitas · anota observações | D1 `session_logs` | **3.3** "Dá pra marcar sem abrir o aluno?" (checkbox no calendário) |
| Sexta 20h | Prepara cobrança da próxima semana | Módulo Pix (ver §5) | **3.4** "Quantos não pagaram esse mês?" (dashboard inadimplência) |
| Domingo 19h | Responde WhatsApp dos alunos da semana | WhatsApp fora do app · farpa mostra template copiável | **3.5** "Posso mandar o link do treino direto no WhatsApp?" |

### 3.2 Loop do aluno

| Momento | A1 Bia (26 anos) | A2 Seu Antônio (68 anos) |
|---|---|---|
| Abrir app | Push notification 1h antes do treino · tap abre treino do dia | PT envia link WhatsApp · Seu Antônio toca uma vez · abre em tela grande com alto contraste já ativo |
| Executar treino | Marca série-a-série no celular (toque grande) · vídeo curto do PT opcional | PT imprime PDF ou lê em voz alta na sessão · app só como referência |
| Fim do treino | RPE 1–10 + humor 1 tap · nota opcional | Não usa — Ju marca "feito" no app dela |
| Feedback ao PT | Emoji rápido · opcional comunidade (se ON) | Conversa presencial na próxima sessão |

**Momento de verdade 3.6** — "Alto contraste é toggle, não default." A1 Bia não quer ver interface preto+laranja o tempo todo; A2 Seu Antônio quer. Servimos os dois (U2).

---

## 5. FASE 4 — Cobrança & Financeiro (diferencial BR)

> Diferencial competitivo vs Trainerize/TrueCoach identificado em F1: **Pix nativo + recibo automático com CREF**.

### 5.1 Fluxo Pix nativo (detalhe §6 de `03-fluxos-pagamento-pix.md`)

Resumo blueprint:

| Passo | Usuário | Front-stage | Back-stage | Sistemas |
|---|---|---|---|---|
| PT gera cobrança | Escolhe aluno · valor · vencimento | Preview do que o aluno receberá · toggle "lembrar auto" | D1 `charges` status=`pending` · gera `txid` e `br_code` | PSP Pix (ex: Inter, Mercado Pago, Efí) via Worker com secret (U6) |
| PT envia link | Clica "Enviar WhatsApp" | Abre wa.me com texto PT/EN + link curto R2 | KV armazena short-link 90d · log analytics | WhatsApp (navegador/app do PT) |
| Aluno paga | Abre QR · paga em app do banco | Fora do farpa — experiência nativa do banco | Webhook PSP → Worker · atualiza `charges.status=paid` · trigger recibo | PSP webhook |
| Emissão recibo | — | PT recebe push "Pix recebido — recibo enviado" · aluno recebe PDF | Worker gera PDF com CREF + CNPJ/MEI + dados do PT + txid · guarda em R2 · envia por WhatsApp/email | R2 · WhatsApp API · email |
| Reconciliação | PT confere dashboard sexta 20h | Dashboard "Pagos · Pendentes · Atrasados" | Query D1 com agregação semanal · cache KV | D1 · KV |

**Momento de verdade 4.1 "Recebi o Pix, onde está o recibo?"** — latência alvo ≤ 30s entre webhook e PDF no WhatsApp do aluno. Se > 2min, P2 Ju perde confiança.

**Momento de verdade 4.2 "Posso cobrar R$ 50 no pacote mensal e R$ 30 avulso?"** — MVP aceita 2 tipos: mensalidade recorrente (manual mês-a-mês, sem débito automático) + avulso.

### 5.2 Inadimplência & cobrança humanizada

| Evento | D0 vencimento | D+3 | D+7 | D+15 |
|---|---|---|---|---|
| Sistema faz | Push discreto ao PT "Aluno X vence hoje" | Sugere template WhatsApp copiável (PT escolhe enviar) | Marca dashboard como "atrasado" · sugere ligar | Flag "revisar relação" · nunca bloqueia acesso do aluno automaticamente |
| Copy | "Hoje vence o plano de {aluno}. Quer enviar um lembrete?" | Template editável: "Oi {nome}, tudo certo? Seu Pix do mês venceu em {data} — segue o link: {url}" | "Quer agendar um papo?" | "Considere pausar ou renegociar — queremos que você decida" |

**Guardrail ADR 014:** farpa Forte **nunca** envia cobrança automática em nome do PT. Sempre o PT aperta o botão. Evita desgaste de relação humana — principal valor declarado por P1 Rafa e P2 Ju.

---

## 6. FASE 5 — Retenção · Suporte · Offboarding

### 6.1 Suporte (detalhe em `02-jornada-suporte.md`)

Camadas: self-service (docs) → chat assíncrono WhatsApp → humano em 24h úteis. MVP **não tem** suporte 24/7.

### 6.2 Retenção ativa

Gatilhos de check-in proativo (e-mail + push, nunca telefone não-solicitado):

- PT não acessa há 7 dias → email "Tudo bem? Podemos ajudar?"
- PT tem ≥ 3 alunos inadimplentes → sugestão de revisão de preço (educativo, sem venda)
- PT completa 90 dias → NPS de 1 pergunta (open field) · resultado visível só para diretoria CMO+CPO

### 6.3 Offboarding (LGPD + ética)

| Passo | Evidência | Back-stage |
|---|---|---|
| PT pede cancelar | Tela "Cancelar conta" com 3 opções: **pausar** · **exportar tudo** · **excluir** | D1 flag `account_status=pausing\|exporting\|deleting` |
| Exportação | Botão "Baixar tudo" gera ZIP com CSV de alunos + PDFs de anamneses/recibos · link R2 válido 30d | Worker agenda job · notifica por email quando pronto · hash assina ZIP |
| Exclusão | Confirmação em 2 passos · janela de 30 dias para desfazer | Soft delete em D1 · hard delete agendado D+30 · anamneses mantidas criptografadas 180d (LGPD) então apagadas |
| Comunicação aos alunos | PT recebe template "Queridos alunos, migrei para…" · nunca enviado automaticamente | — |

**Momento de verdade 5.1 "Posso sair levando meus dados?"** — decisor de adoção em P5 Marcos. Se export falhar ou for incompleto, viraliza negativamente.

---

## 7. Matriz Persona × Fase (prioridade de investimento MVP)

Notação: ● crítico · ◐ importante · ○ secundário

| Persona | F1 Aquisição | F2 Ativação | F3 Uso | F4 Cobrança | F5 Retenção |
|---|---|---|---|---|---|
| P1 Rafa | ◐ | ● | ● | ● | ◐ |
| P2 Ju | ○ (indicação) | ● | ● | ● | ● |
| P3 Lucão | ● (funil Insta) | ● | ◐ | ◐ | ○ |
| P4 Clara | ○ | ◐ | ● (bilingue) | ◐ | ◐ |
| P5 Marcos | ○ | ◐ (CREF) | ◐ | ● (recibo auditável) | ● (export) |
| A1 Bia | — | — | ● | ○ | ○ |
| A2 Seu Antônio | — | ● (link acessível) | ● (alto contraste) | — | ○ |

Investimento MVP concentra em F2 + F3 + F4. F1 depende da CMO (conteúdo orgânico) · F5 tem hardening mínimo (export + soft delete) e evolui no pós-MVP.

---

## 8. Linha de interação interna — dependências críticas

| Sistema | Dono | SLO mínimo MVP | Plano B |
|---|---|---|---|
| admin.farpa.ai IdP | Super Backend + SecOps | 99.5% · login ≤ 3s | Email mágico fallback se OAuth falhar |
| PSP Pix | Super Backend · seleção em F6 PRD | Webhook ≤ 30s · 99.9% | MVP começa com **1** PSP · documenta swap em 90d |
| WhatsApp Business API | Super Backend | 99% · custo por template | Fallback: botão "copiar link" manual |
| Gemini (IA treinos) | Super AI | Resposta ≤ 8s · Tier 2 (ADR 011) | Degradação graciosa: template sem IA sempre disponível |
| R2 (PDFs) | Super Infra | Leitura ≤ 200ms | — |
| D1 | Super Backend | Consultas frequentes via KV · respeita limite diário |

U7 CI self-healing monitora falhas e regista em `## HISTÓRICO DE FALHAS DE CI` do repo.

---

## 9. Touchpoints offline (não-ignoráveis)

1. **Sessão presencial de treino** — o app existe para apoiar esse momento, nunca substituí-lo. Princípio editorial: "telefone guardado na mochila, app consultado em 10s quando necessário."
2. **Auditoria CREF presencial** — PT mostra tablet/notebook com histórico de anamneses versionadas. P5 Marcos. Exige que a tela de auditoria funcione offline-read dos últimos 90d (objetivo pós-MVP · MVP: exige rede).
3. **Condomínio / síndico** — P2 Ju apresenta PDF exportado. Blueprint F5.3 já cobre via exportação.
4. **Indicação boca-a-boca** — PT recomenda em academia · gera cupom curto (pós-MVP).
5. **Conversa no WhatsApp entre PT e aluno** — sempre fora do app; farpa Forte oferece *templates copiáveis*, nunca envia em nome do PT sem clique explícito.

---

## 10. Riscos de serviço & mitigação

| Risco | Persona afetada | Mitigação |
|---|---|---|
| PSP Pix ficar fora do ar na sexta | P1 Rafa · P2 Ju | UI mostra estado do serviço · PT pode marcar "pago manualmente" |
| IA gerar treino inseguro | P5 Marcos · P2 Ju | Badge "IA · revise antes de enviar" · prompt exige anamnese · log da versão · ADR 014 guardrail 1 |
| Comunidade virar tóxica | P2 Ju (alunos idosos) | Default OFF · moderação single-PT · sem DM entre alunos no MVP · ADR 014 guardrail 2 |
| WhatsApp API mudar pricing | Todos | Fallback "copiar link" sempre presente · não depender de push-API obrigatório |
| PT quer sair e perder dados | P5 Marcos · P1 Rafa | Export 1-clique desde MVP · ZIP assinado |
| Alto contraste quebrar algum componente | A2 Seu Antônio · Rodrigo | Teste visual obrigatório em CI (U2) |

---

## 11. Próximos artefatos

- `01-momentos-de-verdade.md` — tabela priorizada P0/P1/A2
- `02-jornada-suporte.md` — fluxo completo
- `03-fluxos-pagamento-pix.md` — diagramas Pix + recibo
- `04-onboarding-humano.md` — primeiro contato PT → 1º aluno cadastrado
- `05-touchpoints-offline.md` — detalhamento (opcional, pode consolidar aqui em §9)

---

*F4 · Service Blueprint · farpa Forte · v1 · 2026-04-19 · consome F1/F2/F3 · ADR 012 + 014 vigentes · bilingual PT-BR + EN*
