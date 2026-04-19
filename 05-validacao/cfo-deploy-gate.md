# CFO — Gate Final pré-deploy F7
> forte-farpa-ai · 2026-04-19 · CFO + Super FP&A + Super Tesouraria

## Estado financeiro

| Item | Status |
|------|--------|
| Workers Paid ativo ($5/mês) | ✅ Aprovado no gate F6 PRD, já incluído no orçamento ecossistema |
| R2 storage | ✅ Free tier (10 GB) — exports GDPR esperam <50 MB/mês no ramp |
| Queues | ✅ Free tier (1M mensagens/mês) — volume projetado <10k/mês |
| Workers AI | ✅ Free tier neurons/dia; fallback Gemini pago apenas se Tier 1 falhar (ADR 014) |
| D1 | ✅ Free tier (5M reads / 100k writes/dia) |
| KV | ✅ Free tier |
| Billing alerts | ✅ Configurados em $10 (warning) e $20 (hard stop) via CF dashboard |

## Unit economics projetadas (MVP 90d)

- Custo fixo: ~R$30/mês (Workers Paid)
- Custo marginal por PT ativo: R$0 (tudo no free tier enquanto <1k PTs)
- Custo marginal por recibo Pix: R$0 (manual, sem gateway)
- Custo Gemini fallback: <R$5/mês projetado com redact+cache

## Veredito CFO

**APROVADO PARA DEPLOY.** Sem risco financeiro identificado. Revisão de custos em 30 dias.

— CFO · 2026-04-19
