# F5 · Validação — Sumário Executivo · farpa Forte
> 2026-04-19 · Super Research & Discovery · entrega ao Orquestrador e Diretoria CPO

---

## Go/No-Go consolidado

| MoT P0 | Veredito | Bloqueio? |
|---|---|---|
| P0.1 Grátis sem asterisco | GO-CONDICIONAL | Não |
| P0.2 Login cross-site | GO-CONDICIONAL | Não (teste matrix browsers) |
| P0.3 Primeiro treino ≤ 5min | GO-CONDICIONAL | **Conflito modo rápido vs clínico** |
| P0.4 Recibo Pix com CREF | GO-CONDICIONAL | Não |
| P0.5 Export LGPD | GO-CONDICIONAL | Não (arquitetura async) |
| P0.6 IA gated por anamnese | **GO** | — |
| P0.7 Comunidade default OFF | GO-CONDICIONAL | Não (3 níveis de UX) |

**Nenhum no-go absoluto.** 6 go-condicionais · 1 go puro.

## 9 refinamentos obrigatórios antes do PRD
1. Onboarding dual-mode (rápido vs clínico)
2. Comunidade em 3 níveis (conta PT · aluno · killswitch)
3. Matriz de browsers para cookie cross-site
4. Export LGPD assíncrono (fila + R2 + email)
5. Modo recibo informal para PT MEI em transição
6. Invoice EN+USD no backlog P1
7. Rota pública demo-treino com watermark
8. Copy de transparência monetização (Pro em breve)
9. SLA recibo Pix em p50/p95

## 8 riscos novos incorporados (R1–R8)
Concentram-se em: dual-mode onboarding (R1) · matriz de browsers (R3) · export assíncrono LGPD (R6).

## Próxima fase
**F6 PRD** com Super PM & Delivery · aguarda confirmação do Founder (regra "uma fase por vez").
ADR candidato: **015 — Onboarding dual-mode**.

---

*farpa Forte · 05-validacao · sumário · v1.0 · 2026-04-19*
