# F4 · CX — Jornada de Suporte · farpa Forte
> Fluxo completo de suporte e resolução de problemas · 2026-04-19 · bilingual PT-BR + EN

---

## 0. Princípios de suporte MVP

1. **Auto-serviço primeiro** — FAQ + docs cobrem 80% dos casos.
2. **WhatsApp assíncrono** como canal humano principal (BR nativo) · nunca síncrono obrigatório no MVP.
3. **Sem 24/7** — SLA humano 24h úteis (seg-sex 9-18 BRT). Declarado honestamente na landing (U8).
4. **Um só dono por ticket** — evita passa-o-pardal. Se escalar, o dono original permanece em CC.
5. **Toda interação logada em D1** — timeline por conta.
6. **Bilingue U1** — PT-BR e EN com paridade real; agente escreve no idioma do usuário.

---

## 1. Taxonomia de problemas (MVP)

| Categoria | Exemplos | Severidade default | Canal recomendado |
|---|---|---|---|
| **Login/Sessão** | Não consigo entrar · sessão cai · OAuth falha | **S1** (bloqueador) | Status page + chat |
| **Pagamento Pix** | Aluno pagou mas recibo não chegou · QR inválido · webhook não atualizou | **S1** | Chat WhatsApp |
| **IA / Treino** | IA deu sugestão estranha · treino não salvou | S2 | Chat assíncrono |
| **Anamnese** | Perdi uma versão · como exportar? | S2 | Docs + chat |
| **Acessibilidade** | Alto contraste não ativa · leitor de tela falha | **S1** (violação U2/U3) | Chat priorizado |
| **Cobrança/Financeiro** | Dúvidas sobre modelo de preço · fatura | S3 | Email |
| **Feature request** | "Queria que tivesse X" | S4 | Form público |
| **Bug visual** | Layout quebrado em viewport Y | S3 | Chat ou form |
| **LGPD / Privacidade** | Quero excluir conta · portabilidade | **S1** | Chat prioritário + email confirmação |

**Definição de severidade:**
- **S1** — afeta uso imediato ou compliance · SLA primeira resposta ≤ 1h útil · resolução meta ≤ 8h úteis
- **S2** — afeta uso mas tem workaround · ≤ 4h úteis / ≤ 24h úteis
- **S3** — não-bloqueador · ≤ 24h úteis / ≤ 72h úteis
- **S4** — sem SLA · triagem semanal

---

## 2. Fluxo canônico de suporte

```
[Usuário percebe problema]
  └─ {abre farpa Forte}
       └─ [Menu Ajuda no header]
            ├─ {FAQ/Docs}           → resolve sozinho (80% alvo)
            ├─ {Status do serviço}  → ve se é incidente em andamento (page em cloudflare)
            └─ {Falar com a gente}
                 └─ [Form triagem — 3 campos: categoria · severidade sugerida · descrição]
                      ⚙ cria ticket T-XXXX em D1 · envia confirmação email
                      └─ ⚑ auth ok?
                           ├─ sim → [Chat WhatsApp ou in-app]
                           └─ não → fluxo "Login quebrado" (§3)
```

### 2.1 Loop dentro do ticket

```
[Ticket aberto]
  → {agente responde em canal escolhido}
  → {usuário responde}
  → ⚑ resolvido?
       ├─ sim → [pedido de rating 1-5 · opcional]  → [fecha ticket · timeline em D1]
       └─ não → continua loop · re-estima severidade a cada 24h
```

---

## 3. Fluxo crítico: login quebrado (S1)

Não podemos exigir que o usuário logue para pedir ajuda com login.

| Passo | Usuário | Front-stage | Back-stage |
|---|---|---|---|
| 1 | Tenta logar · erro | Tela de login mostra CTA secundário "Problemas para entrar? Fale sem login" | — |
| 2 | Clica CTA | Form público com email + descrição · **não exige captcha pesado** (A11y) | Rate limit por IP · Worker guarda em KV 24h |
| 3 | Envia | Confirmação "Recebemos — respondemos em até 1h útil" | Cria ticket anônimo T-XXXX · alerta em canal interno (Slack/Discord ops) |
| 4 | Agente responde | Email com link de verificação alternativo (email mágico) | Worker gera token 15min · loga em D1 `support_magic_tokens` |
| 5 | Usuário acessa | Loga via token · pode trocar credencial | D1 · admin.farpa.ai |

**Invariante reforçado:** U5 cookie cross-site foi causa de incidente Forte 2026-04-18 — checklist de regressão obrigatório quando tocar auth.

---

## 4. Fluxo: Pix pagou mas recibo não chegou (S1)

| Passo | Usuário | Front-stage | Back-stage |
|---|---|---|---|
| 1 | PT ou aluno relata | Docs: "Seu aluno pagou mas você não vê? Clique aqui." | — |
| 2 | Self-check | Tela "Verificar pagamento" com input `txid` ou aluno+valor+data | Worker consulta PSP em tempo real (idempotente) · atualiza D1 se divergência |
| 3 | Confere | ⚑ encontrado? | |
| 3a | sim | "Encontramos! Recibo reenviado agora." | Regenera PDF · R2 · WhatsApp/email |
| 3b | não | "Não encontramos. Abrindo ticket S1." | Cria ticket · agente tem painel com logs webhook PSP |
| 4 | Agente investiga | Explica causa (ex: PSP downtime) e libera recibo manual ou orienta re-emissão | Log em timeline do ticket |

**SLA específico:** recibo ≤ 30s normal, ≤ 5min em fila degradada, ≤ 1h útil com intervenção humana.

---

## 5. Fluxo: Acessibilidade (S1 — U2/U3)

Problemas de acessibilidade são **sempre S1** e nunca podem ser "backlog".

| Passo | Usuário | Ação |
|---|---|---|
| 1 | PT ou aluno reporta | Link "Problema de acessibilidade" no rodapé · sempre visível (U2) |
| 2 | Form reduzido | Nome · descrição · captura opcional de tela · contexto (navegador, leitor de tela) |
| 3 | Triagem | Agente valida em 2h úteis · se reproduzível, vira issue `a11y` com label no repo |
| 4 | Fix | Pipeline U7 CI roda pa11y/axe novamente · deploy · notifica reporter |
| 5 | Follow-up | Agente confere em 7d se problema não voltou |

---

## 6. Fluxo: LGPD (S1 — exclusão/portabilidade)

Ver blueprint §6.3 (Offboarding). Resumo canal de suporte:

- Solicitação de **acesso** aos dados → export em 10 dias corridos (lei)
- Solicitação de **exclusão** → soft delete imediato · hard delete D+30 · confirmação por email em 2 passos
- Solicitação de **portabilidade** → mesmo ZIP do export, formato aberto (CSV + PDF)
- Solicitação de **correção** → self-service na própria interface + log

**Nunca** pedir prova adicional além da confirmação de email se o usuário já está autenticado.

---

## 7. Self-service: estrutura da base de conhecimento

```
docs.farpa.ai/forte/
  ├─ comecar/
  │   ├─ criar-conta
  │   ├─ primeiro-aluno
  │   ├─ primeiro-treino
  │   └─ primeiro-pix
  ├─ alunos/
  ├─ treinos/
  ├─ pagamentos/
  │   ├─ como-emitir-pix
  │   ├─ recibo-automatico
  │   └─ pagou-mas-nao-chegou ← atalho direto
  ├─ anamnese/
  ├─ acessibilidade/
  ├─ privacidade-lgpd/
  │   ├─ exportar-meus-dados
  │   └─ excluir-conta
  └─ troubleshooting/
      ├─ login-nao-funciona
      └─ app-do-aluno
```

Cada artigo segue template:
1. O que é
2. Quando usar
3. Passo-a-passo com screenshot
4. Problemas comuns
5. Falar com a gente (CTA)

**Versão EN paridade obrigatória (U1).**

---

## 8. Status page

URL: `status.farpa.ai/forte` (compartilhada ecosistema, filtro por produto).

Componentes monitorados:
- Pages (forte.farpa.ai)
- Workers (api.forte.farpa.ai)
- D1 · KV · R2
- admin.farpa.ai IdP
- PSP Pix
- WhatsApp Business API
- Gemini

Atualização automática via health-checks + post-mortem público em incidentes S1.

---

## 9. Ferramentas de suporte do agente

MVP **extremamente enxuto** (CFO guardrail de custo):

| Ferramenta | Função | Custo |
|---|---|---|
| Painel interno `forte.farpa.ai/ops` | Buscar usuário · ver timeline · reenviar recibo · gerar token de login alternativo | Free (dogfooding) |
| WhatsApp Business (conta única) | Canal humano | Custo por template — monitorar |
| Email transacional | Confirmações, magic links | Free tier inicial |
| Discord/Slack interno | Alertas + triagem | Free |
| D1 `support_tickets` + `support_events` | Persistência | Free tier |

**Sem Zendesk, sem Intercom** no MVP. Revisitar em 90d se volume > 50 tickets/semana.

---

## 10. Métricas de saúde do suporte

| Métrica | Alvo MVP | Revisão |
|---|---|---|
| % resolvidos por self-service | ≥ 70% | Mensal |
| Tempo primeira resposta S1 | ≤ 1h útil | Semanal |
| Tempo resolução S1 | ≤ 8h úteis | Semanal |
| NPS suporte | ≥ 50 | Trimestral |
| % tickets que viram bugs | Monitorado · meta reduzir 20% MoM | Mensal |

Dashboard em `forte.farpa.ai/ops/metrics` (acesso restrito).

---

## 11. Escalonamento

```
Especialista Suporte (Gerência de Atendimento — perfil ativado dentro de Super UX/CX ou Super Comunidade)
  └─ escala para Gerência de produto (Super PM)
       └─ escala para Diretoria CPO
            └─ arbitra Founder se envolver política ou ADR
```

Um ticket escalado nunca troca de dono sem comunicar o usuário.

---

*F4 · Jornada de Suporte · farpa Forte · v1 · 2026-04-19*
