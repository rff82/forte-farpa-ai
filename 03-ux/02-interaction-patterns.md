# F3 · UX — Interaction Patterns · farpa Forte
> Super UX/CX Design · Gerência Visual/UI · Especialistas A (Motion) + B (Clareza)
> 2026-04-19 · bilingual PT-BR + EN · aplica ADR 014 + DS Editorial Navy Performance

---

## 1. Padrões globais

### 1.1 Navegação
- **Mobile:** bottom tabs fixas, 5 itens PT / 4 aluno · max 12 chars por label · ícone Lucide line 24×24 · estado ativo = navy #1A2B4C fill-bg 10%, label bold.
- **Desktop:** sidebar 240px com seções; collapse para 72px; focus ring orange #F97316 2px (alto contraste).
- **Breadcrumb:** somente em subfluxos profundos (`/alunos/:id/treinos/novo`).

### 1.2 Feedback e estado
- **Toasts:** top-right desktop, bottom mobile; fade 180ms; auto-dismiss 4s; persistem se contém ação ("Desfazer").
- **Skeleton loaders:** para listas > 6 itens · shimmer 1.2s.
- **Empty states:** sempre com CTA primário + micro-copy ("Ainda sem alunos — {Adicionar o primeiro}").
- **Erros:** nunca erro cru · sempre contexto + ação · código técnico apenas em detalhe expandível.

### 1.3 Motion
- Transições padrão 180ms ease-out.
- Bottom-sheets 220ms com overshoot leve.
- IA loading: shimmer + label "IA montando rascunho..." (nunca spinner anônimo — transparência).
- Reduced motion (`prefers-reduced-motion`) desativa todas as transições > 100ms (req U3 + A2 idoso).

---

## 2. Padrões de IA assistida (ADR 014 guardrails)

### 2.1 Princípios
1. **Transparência:** sempre declarar quando IA está envolvida. Badge "AI-assisted" visível ao PT e ao aluno (pedido de Clara).
2. **Editabilidade:** todo output IA é editável antes de publicação. Sem exceção.
3. **Responsabilidade humana:** publicação é ato humano, nunca automático (req P5 Marcos).
4. **Audit log:** cada ação IA grava `{autor_id, modelo, prompt_hash, ia_editada_pct, timestamp}`.
5. **Graceful degradation:** falha LLM → fallback LLM → editor manual. Nunca erro cru.
6. **Toggle granular:** global (conta) + por aluno (Clara/Marcos desligam em cardiopatas).

### 2.2 Padrão "Rascunho IA"
```
[Estado inicial]             — botão "Gerar rascunho com IA" (primary navy) + link "ou começar do zero"
[Loading]                    — shimmer no card do treino + label "IA montando rascunho... ~6s"
                               ⚙ timeout 10s → fallback: "A IA demorou. Quer tentar de novo ou começar do zero?"
[Rascunho gerado]            — badge laranja pequena "Rascunho IA · você é responsável"
                               ⚙ cada exercício tem {editar} {remover} {trocar exercício}
                               ⚙ banner "Revise antes de publicar" · CTA primary: {Publicar para aluno}
[Pós-publicação]             — audit log silencioso + toast "Treino enviado"
```

### 2.3 Padrão "Explicabilidade IA"
Cada sugestão IA tem link "por quê?" que abre popover explicando em linguagem natural:
> "Sugeri agachamento 4×8 porque o objetivo é hipertrofia de MMII e a anamnese indica nenhuma restrição articular."

Obrigatório para Marcos (P5) aceitar audit trail.

---

## 3. Padrões de Comunidade (ADR 014 guardrails)

### 3.1 Ativação (nível conta PT)
```
[Config Comunidade · default OFF]
  └─ Toggle "Ativar comunidade" com warning:
       "Ao ativar, seus alunos verão uma aba 'Comunidade' no app deles.
        Cada aluno precisa aceitar individualmente antes de aparecer."
  ON → abre sub-config (visibilidade, moderação, tipos de post, regras)
```

### 3.2 Opt-in granular (nível aluno)
Modal obrigatório na primeira visita à tab Comunidade com checkboxes granulares:
- ☐ Nome visível · ☐ Foto visível · ☐ Cidade visível
- ☐ Meus PRs · ☐ Meus treinos concluídos · ☐ Minhas fotos antes/depois (default OFF · LGPD especial)

3 CTAs: `{Aceitar configuração}` · `{Somente leitura}` · `{Não participar}`.

### 3.3 Moderação
- Cada post tem menu `[⋯]` → "Denunciar" (modal com categorias: spam · ofensivo · conteúdo médico inadequado · outro).
- Fila de moderação no app PT (se moderador) → {Aprovar} · {Remover} · {Banir autor}.
- Denúncia tripla ativa auto-hide enquanto PT revisa (req P5 cardiopatas — risco de conselho médico mal-informado).

### 3.4 Desativação
- PT desativa comunidade → posts entram em "arquivado" (LGPD art. 16 · guarda de 5 anos · ADR 010).
- Aluno revoga opt-in → dados removidos de feeds em ≤ 24h + email de confirmação.

---

## 4. Formulários e entrada de dados

### 4.1 Anamnese (P0 · crítico para P2/P5)
- Multi-step 3/3 com barra de progresso.
- Auto-save a cada campo (KV) — P1 Rafa em zona de baixo sinal.
- Versionamento: cada {Salvar} cria nova versão, diff visível no histórico.
- Campo "observações médicas" com marker de confidencialidade (hash-key separada · ADR 010).

### 4.2 Editor de treino
- Busca exercício com autocomplete fuzzy (`Levenshtein ≤ 2`).
- Filtros: grupo muscular · equipamento · nível.
- Drag-and-drop para reordenar (desktop); botões `⬆⬇` (mobile · A2 dealbreaker).
- Campos numéricos (séries/reps/carga): input numérico nativo + `<input type="number" inputmode="decimal">`.

### 4.3 Pagamento
- Input valor com máscara BRL · USD (Clara).
- QR Pix gerado server-side (Worker) · imagem 280×280px + botão copiar código.

---

## 5. Estados vazios, loading e erro — catálogo

| Situação | Ilustração | Título | CTA |
|---|---|---|---|
| Zero alunos | ícone pessoa-plus line | "Nenhum aluno ainda" | Adicionar primeiro aluno |
| Zero treinos do aluno | ícone dumbbell | "Sem treinos ativos" | Gerar com IA · Criar manual |
| Zero pagamentos | ícone wallet | "Nenhuma cobrança neste mês" | Criar cobrança |
| IA offline | ícone cloud-off | "IA temporariamente indisponível" | Continuar manual |
| Sem conexão | ícone wifi-off | "Sem internet — salvando local" | (auto-sync ao voltar) |
| Erro de permissão | ícone lock | "Você não tem acesso a esta área" | Voltar |

---

## 6. Divergência A vs B

| # | A Motion | B Clareza | Resolução |
|---|---|---|---|
| ip.1 | "IA loading deve ser spinner + confetti ao final" | "Celebração mascara edição necessária — usar shimmer sóbrio e banner 'Revise'" | **B** — zero confetti em IA · celebração só em PR do aluno |
| ip.2 | "Denúncia em 1 toque" | "1 toque + categoria — sem categoria, fila vira lixeira" | **B** |
| ip.3 | "Badge IA pequena (não poluir)" | "Badge sempre visível no cabeçalho do treino + rodapé do post" | **B** (req P5 + Clara) |

---

*farpa Forte · 03-ux · 02-interaction-patterns · v1.0 · 2026-04-19*
