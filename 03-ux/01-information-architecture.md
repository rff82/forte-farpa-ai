# F3 · UX — Information Architecture · farpa Forte
> Super UX/CX Design · Gerência Interaction · Especialistas A (IA enxuta) + B (IA robusta)
> 2026-04-19 · bilingual PT-BR + EN

---

## 1. Árvore de navegação — App PT

```
forte.farpa.ai (PT)
├── / (Dashboard)                    ← home · cards acionáveis do dia
│   ├── "Sessões de hoje"            · deep-link para Agenda
│   ├── "Pagamentos a receber"       · deep-link para Pagamentos
│   ├── "Alunos sem treino ativo"    · deep-link para Alunos filtrado
│   └── "Pendências rápidas"         · aceitar aluno novo, responder mensagem
│
├── /alunos
│   ├── Lista (filtros: ativos · inativos · inadimplentes · tag)
│   ├── /alunos/novo
│   └── /alunos/:id
│       ├── Visão geral
│       ├── Treinos     → /alunos/:id/treinos · /alunos/:id/treinos/novo
│       ├── Pagamentos  → /alunos/:id/pagamentos
│       ├── Anamnese    → /alunos/:id/anamnese (com histórico versionado)
│       └── Comunidade  (condicional: conta.comunidade === ON)
│
├── /agenda
│   ├── Semana (default desktop) · Dia (default mobile)
│   ├── Filtros por local
│   └── /agenda/:eventoId
│
├── /pagamentos
│   ├── Visão do mês
│   ├── /pagamentos/novo
│   └── /pagamentos/:id
│
├── /biblioteca                      ← templates reutilizáveis
│   ├── Exercícios (pré-cadastrados + meus)
│   └── Templates de treino (meus · comunidade farpa opt-in)
│
├── /comunidade                      (condicional: conta.comunidade === ON)
│   ├── Feed da minha rede
│   ├── Moderação
│   └── Configurações
│
├── /relatorios                      ← CSV/PDF para contador · síndico · CREF
│   ├── Financeiro
│   ├── Anamneses (P5 — auditoria CREF)
│   └── Evolução de alunos (P2 — síndico)
│
└── /configuracoes
    ├── Perfil · CNPJ · CREF
    ├── Idioma (PT/EN · U1) · Tema (auto · light · alto contraste · U2)
    ├── IA (on/off global · por aluno)     ← guardrail ADR 014
    ├── Comunidade (ativar/desativar)      ← guardrail ADR 014
    ├── Privacidade/LGPD (exportar · apagar dados · DPO)  ← req P5
    └── Faturamento (plano farpa Forte)
```

### Navegação primária PT (mobile bottom tabs, 5 itens)
`[Hoje] [Alunos] [Agenda] [$] [Mais]` — "Mais" abre: Biblioteca, Comunidade (se ON), Relatórios, Configurações.

### Desktop
Sidebar fixa à esquerda 240px · collapse para 72px · mantém 7 itens top-level.

---

## 2. Árvore de navegação — App Aluno (padrão · A1)

```
forte.farpa.ai (aluno · contexto do PT autenticado no login)
├── / (Home)
│   ├── Hero "Próximo treino"
│   ├── Streak + próxima sessão
│   └── Card pagamento
│
├── /hoje/treino                 ← executor de treino (focus mode)
├── /evolucao
│   ├── Gráficos (carga, 1RM estimado, frequência)
│   └── Fotos mensais (opt-in · default OFF · consent LGPD)
│
├── /agenda                      ← só leitura + pedido de reagendamento
├── /pagamentos                  ← histórico + próxima
├── /comunidade                  (condicional: PT + aluno opt-in)
└── /configuracoes
    ├── Perfil
    ├── Idioma · Tema (U2 sempre presente)
    ├── Modo "simples" (toggle manual ou ativado pelo PT)
    ├── Privacidade granular (opt-ins de comunidade · fotos · PRs)
    └── Revogar consentimento / apagar conta (LGPD)
```

### Bottom tabs aluno (4 itens)
`[Hoje] [Evolução] [Agenda] [Mais]`

---

## 3. App Aluno modo SIMPLES (A2 Seu Antônio)

Arquitetura colapsada — uma única tela com 3 cartões empilhados, sem tabs, sem navegação.

```
/ (Home simples)
├── Cartão 1: "Seu próximo treino: <dia> às <hora> — <local>"
│   └── [Ver detalhes] → tela única com exercícios em fonte 20px+, zero interação
├── Cartão 2: "Pagamento"
│   └── [Copiar Pix] botão único 48×48
└── Cartão 3: "Falar com <nome do PT>"
    └── deep-link whatsapp://
```

Regras duras:
- Sem rotas internas extras — tudo é overlay ou external link.
- Toggle alto contraste sempre visível no header, pré-ativado.
- Idioma só PT nesse modo (EN desnecessário ao perfil).

---

## 4. Mapa de entidades

```
Account (PT · 1)
  └─ Aluno (n)
      ├─ Anamnese (n versões)
      ├─ Treino (n)
      │   └─ Sessão executada (n)
      ├─ Pagamento (n)
      ├─ Mídia (foto evolução) — consentimento granular
      └─ Consentimentos LGPD (n · registro imutável)

Account
  ├─ Agenda (Evento n)
  ├─ Templates de treino (n)
  └─ Config (idioma, tema, IA on/off, comunidade on/off)

Comunidade (condicional)
  └─ Post (n) → Reação (n) · Denúncia (n)
```

---

## 5. Regras de URL e i18n (U1)

- Rotas canônicas em PT (`/alunos`, `/agenda`). EN como alias via `Accept-Language` ou seletor.
- Path prefix `/en/*` disponível para Clara/expats.
- Seletor de idioma no header, persiste em cookie `forte_lang` (SameSite=Lax OK — não é auth).

---

## 6. Divergência A vs B

| # | A (IA enxuta, 4 tabs) | B (IA robusta, 7 top-level) | Resolução |
|---|---|---|---|
| ia.1 | "Biblioteca dentro de Alunos" | "Biblioteca é top-level porque é reutilizada em cada treino novo" | **B** — top-level |
| ia.2 | "Relatórios = filtro da lista" | "Relatórios é view específica para exportação externa (contador, síndico, CREF)" | **B** — separado |
| ia.3 | "Modo simples = flag oculta" | "Modo simples é cidadão de primeira classe — toggle visível no perfil PT e aluno" | **B** — cidadão de primeira classe |

---

*farpa Forte · 03-ux · 01-information-architecture · v1.0 · 2026-04-19*
