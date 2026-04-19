# F6 · Riscos e Mitigações — farpa Forte MVP
> Super PM & Delivery + Especialista B (Risco) · 2026-04-19
> Expansão dos 8 riscos R1-R8 de F5 + 4 novos riscos identificados em F6

---

## Matriz de riscos

| # | Risco | Prob | Impacto | Score | Mitigação | Dono | Gate |
|---|---|---|---|---|---|---|---|
| R1 | Dual-mode mal implementado → PT confuso entre rápido e clínico | M | A | 9 | ADR 015 + UX explícita + toggle claro + tooltip | Frontend + CPO | S3 review |
| R2 | Invoice EN ausente no MVP derruba Clara como early adopter | B | M | 4 | P1.1 no backlog · comunicar Clara como limitação conhecida | PM | Piloto |
| R3 | Matrix browsers quebra em produção após deploy | M | A | 9 | E12 CI obrigatório · regressão do incidente 2026-04-18 · rollback plan | SecOps | S5 gate |
| R4 | PT MEI em transição não consegue emitir recibo | A | A | 12 | Modo informal no MVP · copy clara · estado fiscal editável | Backend | S4 |
| R5 | Demo pública abusada (bot scraping/spam) | M | M | 6 | Rate-limit 10/hora/IP · KV cache · CAPTCHA se threshold | SecOps | S2 |
| R6 | Export LGPD timeout em conta grande → violação art. 18 | M | A | 9 | Queue + worker dedicado + SLA p95 30min + email de status | Infra + SecOps | S4 |
| R7 | Copy "Pro em breve" gera expectativa que atrasa → churn | B | M | 4 | CMO aprova copy · data realista · FAQ "quando vira pago" | CMO | S1 |
| R8 | Recibo Pix cold-start viola SLA percebido pelo PT | M | M | 6 | p50/p95 ao invés de absoluto · pré-warm em P1 · transparência de status | Infra | S4 |
| **R9** *novo* | IA Gemini mudança de preço ou rate-limit quebra MVP | B | A | 6 | ADR 011 Tier 2 · fallback local (treinos-modelo pré-computados em KV) | AI | S2 |
| **R10** *novo* | Free Tier Cloudflare excedido em piloto pago (P1.7) | M | A | 9 | Dashboard de uso em `/admin` · alerta 80% · upgrade plan com CFO | Infra + CFO | S5 |
| **R11** *novo* | LGPD: audit log de IA expõe dados sensíveis em export | B | A | 6 | SecOps review · redact PII de prompts antes de log · encriptação em rest | SecOps | S2 |
| **R12** *novo* | Assinatura simples (hash) contestada juridicamente por aluno | B | A | 6 | P1.4 ICP-Brasil · copy de aceitação clara · timestamp+IP+UA suficiente MVP | Backend + Legal | S3 |

**Escala:** Prob/Impacto (B=1 · M=2 · A=3) · Score = P×I×reach

---

## Top 3 riscos bloqueantes (Score ≥9)

### R4 — PT MEI em transição (Score 12)
Se Lucão não conseguir emitir recibo no dia que validou cadastro, ele vaza para concorrente antes de 24h. **Modo informal é mandatório no MVP.**

### R1, R3, R6, R10 (Score 9)
Todos com mitigação específica já embutida no PRD (ADR 015 · E12 · Queues · dashboard).

---

## Plano de contingência

- **Rollback unificado:** toda deploy usa feature flag em KV (`forte:flags:<feature>`). Incidente vira `OFF` sem novo deploy.
- **Postmortem:** qualquer incidente P0 gera `10-sessoes/YYYY-MM-DD-incidente-<id>.md` + ADR se decisão estrutural.

---

*farpa Forte · 06-prd · riscos · v1.0 · 2026-04-19*
