# F3 · UX — User Flows · farpa Forte
> Super UX/CX Design · Gerência Interaction Design · Especialistas A (Interaction pragmático) + B (Task-flow rigor)
> 2026-04-19 · bilingual PT-BR + EN · consome F1 Research + F2 Personas + ADR 014

---

## 0. Escopo

Fluxos MVP derivados das personas P0/P1 (Rafa, Ju, Lucão, Clara) e dos alunos A1/A2. Cada fluxo respeita:
- Invariantes U1 bilingue · U2 toggle alto contraste sempre no header · U3 WCAG AA · U5 cookie cross-site
- ADR 014 guardrails (IA editável + comunidade default OFF)
- DS Editorial Navy Performance (light-first, Lexend, 4px radius)

Notação: `[Tela]` = surface · `{ação}` = ação do usuário · `→` = transição · `⚑` = decisão · `⚙` = evento de sistema.

---

## 1. Jornada-mãe do PT (P1 Rafa como caso base)

```
[Landing forte.farpa.ai]
  └─ {clica "Começar grátis"} → [OAuth admin.farpa.ai] ⚙ cookie forte_sid SameSite=None Partitioned
                                 └─ ⚑ novo usuário?
                                      ├─ sim → F1.1 Onboarding PT
                                      └─ não → [Dashboard PT]
```

### F1.1 Onboarding PT (≤ 6 etapas, ≤ 5 min)

```
1. [Boas-vindas]                    — nome, CREF (opcional no MVP, dealbreaker P5 em tier compliance)
2. [Escopo de atuação]              — academia | condomínio | casa | híbrido  (multi-select)
3. [Primeiro aluno] (opcional skip) — nome + WhatsApp; gera convite Pix/WhatsApp
4. [Política de IA]                 — toggle "usar IA para sugerir treinos" ON por default (P1/P3) · explica "você sempre edita" (guardrail ADR 014)
5. [Política de comunidade]         — default OFF (guardrail ADR 014) · micro-copy "você pode ativar depois"
6. [Pronto]                         — CTA "Ir pro dashboard"
```

Regras:
- Barra de progresso 1/6 sempre visível.
- Botão "Voltar" habilitado em todas exceto passo 1.
- Skip permitido nas etapas 3 e 5 (não em 4 — decisão consciente exigida).
- Toggle alto contraste presente no header desde a etapa 1 (U2 — Rodrigo/Seu Antônio).

---

## 2. Fluxo: Gestão de alunos (P0 — Rafa, Ju)

```
[Dashboard PT] → aba {Alunos}
  └─ [Lista de alunos]  (filtro: ativos · inativos · inadimplentes)
       ├─ {+ Novo aluno}
       │    └─ [Form anamnese step 1/3] → [step 2/3 PARQ/histórico] → [step 3/3 foto inicial opcional]
       │         ⚙ anamnese versionada (req P5) · timestamp + autor
       │         → [Perfil do aluno]
       │
       ├─ {clica aluno X}
       │    └─ [Perfil do aluno]
       │         ├─ Tab Visão geral   (streak, última sessão, próximo treino, status pagamento)
       │         ├─ Tab Treinos       (lista de prescrições + {+ Novo treino})
       │         ├─ Tab Pagamentos    (histórico + próxima cobrança)
       │         ├─ Tab Anamnese      (versão atual + histórico versionado)
       │         └─ Tab Comunidade    (só aparece se conta.comunidade === on)
       │
       └─ {bulk action} → enviar lembrete · aplicar template de treino · marcar pago
```

Guardrails:
- Exclusão de aluno exige confirmação em 2 passos + mantém arquivo 180 dias (LGPD — P5).
- Anamnese nunca é sobrescrita — sempre nova versão (req P5 Marcos).
- Campo "origem" opcional (Instagram, indicação, academia) para P3 Lucão medir funil.

---

## 3. Fluxo: Agenda (P0 — Rafa, Ju · P1 — Lucão, Clara)

```
[Dashboard PT] → aba {Agenda}
  └─ [Calendário semanal]     (view default · responsive mobile: lista do dia)
       ├─ {clica slot vazio}
       │    └─ [Bottom-sheet "Novo agendamento"]
       │         └─ seleciona aluno → horário → local (chip multi-local) → recorrência? → {Confirmar}
       │              ⚙ se conflito detectado → banner laranja "Conflito com X" (não bloqueia)
       │              ⚙ notificação WhatsApp opcional (toggle padrão ON)
       │
       ├─ {clica evento}
       │    └─ [Detalhe] → {Marcar realizado} · {Reagendar} · {Cancelar}
       │         ⚙ "realizado" dispara streak do aluno (gameficação sutil)
       │
       └─ {filtro por local}   (chips: condomínio A · academia X · casa)
```

Edge (P2 Ju · 42 alunos · 3 locais): view agrupada por local é obrigatória em mobile.

---

## 4. Fluxo: Pagamentos (P0 — todos os PTs)

```
[Dashboard PT] → aba {Pagamentos}
  └─ [Visão do mês]      (total previsto · recebido · em atraso)
       ├─ {criar cobrança}
       │    └─ [Bottom-sheet] aluno → valor → vencimento → método (Pix · boleto futuro)
       │         ⚙ gera QR Pix + link short → copia ou envia WhatsApp
       │         ⚙ recibo automático em PDF (P1 dealbreaker · resolve "esquecimento")
       │
       ├─ {lembrete automático}     — D-3, D0, D+3 (toggle por aluno, default ON)
       │
       ├─ {exportar CSV/PDF}        — mensal · trimestral (P2 Ju pro síndico · P5 pro contador)
       │
       └─ [Linha do aluno]          — status chip: ✓ pago · ⏳ pendente · ⚠ atraso
```

Microcopy sensível (P1): nunca dizer "cobrar" agressivamente — usar "enviar lembrete amigável".

---

## 5. Fluxo: Prescrição com IA (P1 Rafa · P3 Lucão · guardrails ADR 014)

```
[Perfil do aluno] → tab {Treinos} → {+ Novo treino}
  └─ [Modal/Fullscreen "Criar treino"]
       ├─ Step 1 · Escopo        — objetivo (hipertrofia · emagrecimento · condicionamento · reabilitação)
       │                            → restrições (puxa da anamnese automaticamente)
       │                            → duração · frequência semanal
       │
       ├─ Step 2 · Rascunho IA   ⚑ se ia_enabled === true
       │   └─ [Loading state "IA está montando rascunho..."]  (≤ 8s · senão timeout gentil)
       │       → [Rascunho editável]
       │            ⚙ badge explícito "Rascunho gerado por IA · você é responsável" (req P5)
       │            ⚙ cada bloco: {editar} {remover} {substituir exercício}
       │            ⚙ botão "começar do zero" sempre presente (guardrail: IA nunca trava)
       │
       ├─ Step 2-alt · Manual    ⚑ se ia_enabled === false OU PT clicou "do zero"
       │   └─ [Editor manual] — adicionar exercício (busca + filtro por grupo) → séries · reps · carga · RIR
       │
       ├─ Step 3 · Revisão       — preview como o aluno verá
       │   └─ {Publicar para aluno}
       │        ⚙ grava audit log: {autor, ia_usada: bool, ia_editada_em_%, timestamp} (req P5)
       │        ⚙ notifica aluno
       │
       └─ ⚑ toggle por aluno: "usar IA para este aluno" (guardrail ADR 014 — Clara/Marcos podem desligar)
```

Interaction patterns críticos:
- IA **nunca** auto-publica. Sempre exige `{Publicar}` humano.
- Edição de rascunho IA é rastreada em % → campo "ia_editada_em_%" no audit log.
- Fallback LLM: se Workers AI falha, cai para Gemini (ADR 011); se Gemini falha, **mostra editor manual** — nunca erro cru.
- Badge "AI-assisted" visível ao aluno (Clara pediu transparência com expats).

---

## 6. Fluxo: Comunidade (P1 — Lucão · guardrails ADR 014)

```
[Dashboard PT] → {Configurações} → {Comunidade}
  └─ ⚑ toggle "Ativar comunidade para minha conta"    (default OFF)
       ├─ OFF → tab "Comunidade" some do perfil dos alunos (Marcos/Antônio nem sabem que existe)
       └─ ON  → configurações adicionais:
             ├─ visibilidade: só meus alunos · meus alunos + rede farpa (opt-in)
             ├─ moderação: apenas eu · eu + moderador convidado
             ├─ tipos de post permitidos: treino concluído · PR · foto antes/depois (toggle)
             └─ regras de conduta (template pré-pronto, editável)
```

Aluno:
```
[Perfil aluno] → aba {Comunidade}  (só aparece se conta PT comunidade === ON)
  └─ primeira visita: [Modal opt-in]
       ├─ "Quer aparecer na comunidade do seu PT?"
       ├─ opções granulares (ADR 014 + Clara):
       │    □ Nome visível         □ Foto visível
       │    □ Meus PRs             □ Meus treinos concluídos
       │    □ Minhas fotos antes/depois  (default OFF)
       └─ {Aceitar} · {Participar somente lendo} · {Não participar}
            ⚙ grava consentimento LGPD com timestamp + IP (ADR 010 · req P5)
```

Guardrails hard:
- PT desativa comunidade → posts existentes vão para "arquivado" (não apaga · LGPD) e somem das views.
- Aluno revoga opt-in → dados dele removidos dos feeds em ≤ 24h.
- Denúncia em 1 toque em qualquer post · fila de moderação.

---

## 7. Fluxos do ALUNO

### A1 Bia (power-user · P0)
```
[Login aluno] → [Dashboard aluno]
  ├─ Hero card: "Próximo treino: hoje 18h · Academia X"      (zero-click target principal)
  ├─ Card "Treino de hoje"  → {Abrir} → [Executor de treino]
  │    ├─ Exercício 1/8  — série/reps/carga/RIR + cronômetro
  │    │    ⚙ autofill com a última carga (req A1)
  │    │    ⚙ {salvar} entre séries · offline-first (KV local)
  │    └─ {Finalizar treino} → gera streak · opcional post comunidade
  │
  ├─ Card Evolução          → [Gráfico de carga 1RM estimado · side-by-side foto mensal]  (req A1)
  ├─ Card Próximas sessões
  └─ Card Pagamentos        (minha situação)
```

### A2 Seu Antônio (passivo low-tech · P0 dealbreaker U2/U3)
```
[Login aluno simplificado]      ← variante "simples" detectada via toggle no perfil PT (Ju ativa)
  └─ [Home minimalista]
       ├─ Cartão GIGANTE   "Próximo treino: QUI 8h — Salão do condomínio"
       │    └─ {Ver detalhes} — 1 tela só, fonte grande, nada de abas
       ├─ Cartão           "Como pagar" — Pix copiável, 1 botão
       └─ Cartão           "Falar com Juliana" — abre WhatsApp direto
```

Variante "simples" obriga:
- Fonte base 20px (não 16) · botões 48×48px mínimo · 1 CTA por tela · zero comunidade · zero gráfico.
- Alto contraste já vem ON por default neste modo (toggle continua no header, mas pré-ativado).

---

## 8. Diff de navegação PT vs Aluno

| Elemento | App PT | App Aluno padrão | App Aluno "simples" (A2) |
|---|---|---|---|
| Navegação primária | Sidebar (desktop) / bottom tabs 5 itens (mobile) | Bottom tabs 4 itens | 1 tela só + header |
| Header | logo + idioma + alto contraste + perfil | idem | idem (alto contraste pré-ON) |
| Densidade | média-alta | média | baixa (hero único) |
| Tipografia base | Lexend 16 / 14 / 12 | Lexend 16 / 14 | Lexend 20 / 16 |
| Radius | 4/6/8 | 4/6/8 | 8/12 (mais mole, acolhedor) |

---

## 9. Divergências A vs B resolvidas

| # | A Interaction pragmático | B Task-flow rigor | Resolução |
|---|---|---|---|
| f.1 | "Gestão de alunos e agenda podem compartilhar tab — reduz navegação" | "Separar é fundamental — IA do app precisa refletir o JTBD; Rafa pensa em alunos, não em calendário" | **B prevalece** — tabs separadas, cross-link no perfil |
| f.2 | "IA pode publicar auto se PT marcou 'confio 100%'" | "Nunca — audit log + humano no loop é inegociável (P5)" | **B prevalece** — ADR 014 reforçado |
| f.3 | "Variante 'simples' do aluno é overengineering no MVP" | "É o dealbreaker U2/U3 de Seu Antônio — sem isso Ju não adota" | **B prevalece** — entra no MVP como toggle simples |

Nenhuma escalada à Diretoria.

---

## 10. Handoff para próximos arquivos F3

- `01-information-architecture.md` — IA detalhada PT vs Aluno
- `02-interaction-patterns.md` — padrões IA-assistida + comunidade
- `03-accessibility-spec.md` — U2/U3 como spec executável

---

*farpa Forte · 03-ux · 00-user-flows · v1.0 · 2026-04-19 · Super UX/CX Design · bilingual PT-BR + EN*
