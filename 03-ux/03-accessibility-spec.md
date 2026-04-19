# F3 · UX — Accessibility Spec · farpa Forte
> Super UX/CX Design · Gerência Visual/UI · Especialistas A (Padrão a11y) + B (Campo baixa visão)
> 2026-04-19 · bilingual PT-BR + EN · U2 + U3 executáveis

---

## 0. Por que esta spec é dealbreaker

Três personas elevam acessibilidade a requisito de existência:
- **A2 Seu Antônio (68, baixa visão, low-tech)** — se não consegue usar, P2 Ju não adota.
- **Aluno alemão da Clara** — citou WCAG explicitamente ao abandonar Trainerize.
- **P5 Marcos** — atende alunos 60+ cardiopatas · considera baixa visão corriqueiro.
- **Rodrigo (founder)** — baixa visão pessoal · Constituição farpa.ai.

---

## 1. Baseline obrigatório (U3 · WCAG AA)

| Critério | Alvo | Verificação |
|---|---|---|
| Contraste texto normal | ≥ 4.5:1 | axe + Lighthouse CI |
| Contraste texto grande (≥18pt) | ≥ 3.0:1 | idem |
| Contraste componentes UI | ≥ 3.0:1 | idem |
| Focus ring visível | sempre, 2px mínimo | manual + axe |
| Target tap size | ≥ 44×44px mobile · ≥ 48×48px no modo simples | manual |
| Zoom até 200% | sem perda funcional | manual |
| Reduced motion | `prefers-reduced-motion` desativa animações > 100ms | código |
| Navegação por teclado | todo fluxo completável sem mouse | manual |
| Screen reader | fluxos P0 testados com VoiceOver iOS + NVDA | manual |

### Light mode contrastes reais
- Navy #1A2B4C sobre branco = **12.5:1** ✅
- Texto secundário #475569 sobre branco = **7.9:1** ✅
- Orange #F97316 sobre branco = **3.4:1** — usar somente em texto grande ou ícones com label.

### Alto contraste (toggle U2) — dark mode
- Orange #F97316 sobre #0A0B0D = **8.9:1** ✅
- Branco sobre #0A0B0D = **19.2:1** ✅

---

## 2. Toggle alto contraste (U2) — spec executável

### 2.1 Localização
- **Header em todas as páginas**, incluindo landing, login, onboarding, app PT, app aluno, modo simples.
- Posição canônica: header `<button id="btn-alto-contraste">`.
- Ícone: `data-icon="contrast"` (Lucide). Label acessível PT "Alto contraste" / EN "High contrast".
- Atalho teclado: `Alt+K`.

### 2.2 Comportamento
- Clique → body ganha `.theme-alto-contraste` → `theme-engine.js` persiste `localStorage.farpa-tema = 'alto-contraste'`.
- Persistência cross-page garantida pelo engine (já implementado).
- `aria-pressed="true|false"` reflete estado.
- Anúncio screen reader: "Alto contraste ativado" / "desativado".

### 2.3 Regras hard
- Nunca enterrar em submenu.
- Nunca exigir conta logada para testar.
- Nunca deslocar o toggle para preferências só (continua no header mesmo após configurado).
- Modo simples do aluno: toggle **pré-ativado** por default, mas ainda operável.

---

## 3. Spec "Modo simples" (A2 Seu Antônio)

Variante ativada por:
1. PT ativa no perfil do aluno (toggle "aluno preferiu modo simples").
2. Aluno ativa manualmente em configurações.
3. Detecção automática (opcional MVP+1): idade > 65 ou uso do toggle alto contraste por 3 sessões.

Spec:
| Parâmetro | Valor |
|---|---|
| Fonte base | 20px (vs 16px padrão) |
| Fonte títulos | 28px / 24px |
| Line-height | 1.6 |
| Botão primário altura | 56px |
| Tap target mínimo | 48×48px |
| CTAs por tela | 1 primário (+ no máx 1 secundário) |
| Navegação | nenhuma (tela única) |
| Motion | reduzida por default |
| Alto contraste | ON por default |
| Idioma | PT-BR fixo |
| Comunidade | oculta completamente |
| Feedback háptico | strong (onde suportado) |

---

## 4. Bilinguismo a11y (U1 · P4 Clara · aluno alemão)

- Todo `lang` attribute correto: `<html lang="pt-BR">` ou `<html lang="en">` por path.
- Seletor idioma no header com `aria-label`.
- Labels de form, mensagens de erro, toasts, aria-labels — **todos traduzidos nativamente**, nunca via Google Translate.
- Números: locale-aware (`Intl.NumberFormat`) — R$ BRL vs $ USD.
- Datas: locale-aware (`Intl.DateTimeFormat`).

---

## 5. Estrutura semântica

- `<header>` / `<nav>` / `<main>` / `<aside>` / `<footer>` em toda página.
- Somente 1 `<h1>` por página.
- Lista de alunos, agenda, pagamentos usam `<ul>` + `<li>` com `role="list"`.
- Modais usam `role="dialog"` + `aria-modal="true"` + focus trap.
- Bottom-sheets anunciados como "Aberto bottom sheet <título>".
- Ícones: decorativos `aria-hidden="true"`; funcionais têm `<span class="sr-only">` ou `aria-label`.

---

## 6. Formulários acessíveis

- Todo `<input>` tem `<label>` visível (não placeholder-only).
- Mensagens de erro por campo com `aria-describedby`.
- Agrupamentos com `<fieldset>` + `<legend>`.
- Autocomplete de exercícios: `role="combobox"` + `aria-expanded` + setas navegam opções.
- Pix QR: acompanhado de código Pix em texto copiável (não apenas imagem).

---

## 7. Executor de treino (focus mode)

Spec específica por ser contexto de uso crítico (academia, suor, pouco tempo):
- Fonte base 20px nesse modo, mesmo fora do modo simples.
- Contraste mínimo 7:1 (AAA) por default.
- Botão "salvar série" 64×64px.
- Toque acidental mitigado: ação destrutiva exige long-press 400ms.
- Cronômetro anunciado para screen reader a cada 10s.

---

## 8. IA e a11y (ADR 014)

- Badge "AI-assisted" tem `aria-label` explícito.
- Popover "por quê?" acessível via teclado + screen reader.
- Estado loading anunciado: "IA está gerando rascunho".
- Falha anunciada: "IA indisponível. Continuando em modo manual".

---

## 9. Comunidade e a11y

- Feed usa `role="feed"` + `aria-busy` durante load.
- Cada post com heading estruturado `<h3>` (autor) → `<time>` → conteúdo.
- Opt-in granular: cada checkbox com label descritiva + `aria-describedby` explicando consequência LGPD.

---

## 10. Teste de aceitação por persona

| Teste | Persona | Critério de sucesso |
|---|---|---|
| Abrir app, ver treino do dia, começar em ≤ 3 toques | A2 Seu Antônio | ✅ sem ajuda externa, fonte ≥ 20px |
| Executor de treino com suor/dedo úmido | A1 Bia | ✅ tap targets 64px ok, autofill carga ok |
| Toggle alto contraste em qualquer tela | Rodrigo | ✅ visível sempre · ≤ 1 toque |
| Bilinguismo em tempo real no onboarding | Clara + aluno alemão | ✅ PT↔EN sem tradução percebida |
| Navegação só com teclado | QA interno + P5 | ✅ fluxos P0 completáveis |
| VoiceOver lê prescrição IA | P5 Marcos | ✅ audit log lido corretamente |
| Modo simples esconde comunidade | P5 + P2 | ✅ tab invisível no modo simples |

---

## 11. Divergência A vs B

| # | A Padrão a11y | B Campo baixa visão | Resolução |
|---|---|---|---|
| a.1 | "Toggle alto contraste em settings basta" | "Constituição (U2) diz HEADER — Rodrigo tem baixa visão, isso não é discussão" | **B** — fora de negociação |
| a.2 | "Modo simples pode ser só fonte grande" | "É cidadão de primeira classe: 1 tela, sem tabs, alto contraste ON, 1 CTA" | **B** — modo completo no MVP |
| a.3 | "WCAG AA é suficiente universalmente" | "Executor de treino merece AAA por contexto de uso (suor, academia)" | **Híbrido** — AA global, AAA no executor |

---

## 12. Métricas de auditoria (CI)

- `axe-core` em `/`, `/login`, `/alunos`, `/agenda`, `/hoje/treino` (aluno) → zero `critical` ou `serious`.
- Lighthouse a11y ≥ 95 em todas as rotas acima.
- Contraste automatizado no `forte.css` via script de tokens.
- Testes manuais trimestrais com VoiceOver + NVDA.

---

*farpa Forte · 03-ux · 03-accessibility-spec · v1.0 · 2026-04-19 · U2+U3 executáveis*
