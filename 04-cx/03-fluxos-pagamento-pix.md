# F4 · CX — Fluxos de Pagamento Pix + Recibo Automático · farpa Forte
> Diferencial competitivo BR · 2026-04-19 · bilingual PT-BR + EN

---

## 0. Por que isso existe

F1 Research identificou que **Trainerize/TrueCoach não têm Pix nativo nem recibo com CREF**. É o diferencial BR mais citado nas hipóteses H2 e H4 do Research Brief. É o que justifica WTP mesmo em P3 Lucão (sensível a preço).

**Princípios:**
1. **Pix é o rail primário** · cartão é pós-MVP (Super FP&A aprova em Q3/2026).
2. **Recibo automático com CREF do PT** é inseparável do Pix — nunca é feature opcional.
3. **farpa Forte nunca debita automaticamente** · sempre PT clica "Cobrar" ou aluno escaneia QR.
4. **PSP swap em ≤ 90 dias** — arquitetura abstrai PSP, MVP escolhe 1 (decisão em F6 PRD com Super Backend + CFO).

---

## 1. Modelo conceitual de dados (resumo)

```
charges
  id · athlete_id · trainer_id · amount_cents · due_date · status
  status: draft | pending | paid | failed | canceled | refunded
  pix_txid · pix_br_code · psp_provider · created_at · paid_at

receipts
  id · charge_id · pdf_r2_key · number (sequencial por PT) · issued_at
  trainer_cref · trainer_cnpj_or_mei · trainer_name · athlete_name
  hash_sha256 (integridade)

pix_webhook_events  (idempotente)
  id · psp_provider · external_id · raw_payload_r2_key · received_at · processed_at
```

Armazenamento: D1 para estruturado, R2 para PDFs e payload cru.

---

## 2. Fluxo A — Cobrança avulsa (MVP padrão)

```
[PT em perfil do aluno] → {Tab Pagamentos}
  └─ {+ Nova cobrança}
       └─ [Form cobrança]
            - valor (R$) · vencimento (padrão hoje+7) · descrição opcional
            - toggle "lembrar 1x" (default OFF — respeita guardrail ADR 014 de não automatizar cobrança)
            - toggle "emitir recibo ao pagar" (default ON · bloqueado ON para P2/P5)
            → {Gerar cobrança}
                 ⚙ valida dados fiscais do PT (CREF preenchido? CNPJ/MEI?)
                 ⚙ POST Worker /api/charges  · chama PSP.create_pix(amount, description, txid_sugerido)
                 ⚙ D1 insert charges status=pending
                 → [Tela "Cobrança pronta"]
                       - QR Code grande
                       - "Copia e cola" (br_code)
                       - "Enviar por WhatsApp" → wa.me prefilled (PT/EN)
                       - "Copiar link curto" (KV short-link 90d)
                       - "Ver como o aluno vê" (preview)
```

### 2.1 Visão do aluno (link público curto)

Rota: `forte.farpa.ai/p/{short}`

```
[Página de cobrança — mobile-first]
  - Header mínimo · toggle alto contraste (U2)
  - "Olá {nome}, seu PT {nome_PT} enviou uma cobrança"
  - Valor · descrição · vencimento
  - QR grande + botão "Copiar código Pix"
  - Alerta se vencida
  - Footer com CREF + CNPJ/MEI do PT · "Dúvidas? Fale com {PT}" (wa.me)
```

**U1** — rota detecta `Accept-Language` + override PT/EN.
**U2/U3** — se `athlete.a11y_preference = true`, página abre com alto contraste e fonte base 18px.

---

## 3. Fluxo B — Webhook → recibo automático

```
[PSP] → POST /api/webhooks/pix (Worker)
  ⚙ valida assinatura HMAC (secret via wrangler secret — U6)
  ⚙ verifica idempotência: pix_webhook_events.external_id já existe?
       └─ sim → 200 OK · sai
  ⚙ UPDATE charges SET status='paid', paid_at=now() WHERE pix_txid=:txid AND status='pending'
  ⚙ ⚑ linha afetada?
       ├─ não (cobrança inexistente ou já paga) → log + alerta ops · 200 OK
       └─ sim → dispara job "emit_receipt"
  
[Job emit_receipt] (dentro do mesmo Worker request se possível · ≤ 30s)
  ⚙ busca charge + trainer + athlete
  ⚙ valida trainer tem CREF + (CNPJ OR MEI)
  ⚙ gera PDF (HTML → PDF via Worker lib ou edge-PDF)
       - header logo farpa Forte + by farpa (marca guarda-chuva)
       - número sequencial (por PT)
       - emissor: nome PT · CREF · CNPJ/MEI
       - tomador: nome aluno
       - valor · descrição · data pagamento · txid
       - hash SHA-256 do conteúdo no rodapé (integridade)
  ⚙ R2.put(pdf_r2_key) · INSERT receipts
  ⚙ WhatsApp API (template aprovado) → aluno: "Recibo disponível: {short_link}"
  ⚙ push ao PT: "Pix recebido · recibo enviado"
  ⚙ métricas: latency webhook→receipt em KV diário

SLA: latency ≤ 30s em 95% · ≤ 2min em 99%.
```

### 3.1 Falha graciosa

- Se PSP webhook atrasa > 30min → job cron `reconcile_pix` consulta PSP para cada `pending` com vencimento ≤ hoje+1.
- Se geração de PDF falha → marca `receipts.status=deferred` · dashboard ops mostra fila · retry exponencial.
- Se WhatsApp API falha → fallback email · fallback nota in-app "toque para baixar recibo".

---

## 4. Fluxo C — Pix reconciliação manual (PT sem webhook)

Cenário P1 Rafa usa PSP que não suporta webhook na conta dele, ou em migração.

```
[Tab Pagamentos] → {Conferir pagamentos}
  └─ botão "Sincronizar agora" (rate limit 1x/min)
       ⚙ Worker consulta PSP.list_pix(since=last_sync)
       ⚙ match por txid · atualiza D1 · emite recibos faltantes
       → toast "3 pagamentos sincronizados · 3 recibos enviados"
```

Também disponível: **"Marcar como pago manualmente"** por cobrança (caso PT recebeu Pix fora do sistema). Exige digitar os 4 últimos do txid bancário para correspondência mínima.

---

## 5. Fluxo D — Link de bio (P3 Lucão)

Rota pública: `forte.farpa.ai/c/{trainer_slug}` ("contratar com Lucão")

```
[Landing trainer público]
  - Nome + CREF + foto + bio curta do PT
  - CTA "Começar como aluno"
  └─ {clica}
       └─ [Form anamnese pública step 1/3] → [step 2/3] → [step 3/3 email+whats]
            ⚙ cria athlete em D1 status=`prospect`
            → [Proposta de pagamento inicial]
                 - valor default configurado pelo PT (ex: R$ 150 pacote primeiro mês)
                 - QR Pix gerado
                 → pós-pagamento webhook converte status=`active` · cria conta do aluno
                 → PT recebe push "Novo aluno {nome} entrou via bio"
```

**Guardrail** — esse fluxo **exige** anamnese completa antes do Pix, não depois (P5 Marcos dealbreaker).

---

## 6. Estados e transições de `charges`

```
draft → pending → paid
                ↘ failed (PSP rejeitou)
                ↘ canceled (PT cancelou manualmente)
paid → refunded (raro MVP · manual via ops)
```

Regras:
- `draft` permite edição · `pending` permite cancelar, não editar.
- `paid` imutável exceto refund (trilha em audit log).
- `canceled` preserva histórico · não some da lista.

---

## 7. Lembretes de vencimento (opt-in por cobrança)

Guardrail ADR 014 revisitado: cobrança automatizada não é enviada em nome do PT sem clique.

**Alternativa MVP:**
- Toggle "lembrar 1x" na criação → farpa Forte envia **ao próprio PT** (não ao aluno) um push na data de vencimento "Cobrança de {aluno} vence hoje. Enviar lembrete?"
- PT clica → WhatsApp prefilled ao aluno (template copiável) · PT envia.

Zero mensagens automáticas do sistema direto ao aluno sobre cobrança.

---

## 8. Recibo — template (resumo visual)

```
┌─────────────────────────────────────────┐
│ [farpa Forte · by farpa]                │
│                                         │
│ RECIBO · RECEIPT                        │
│ nº 0000123 · emitido em DD/MM/AAAA       │
│                                         │
│ Recebi de:                              │
│   {nome aluno}                          │
│                                         │
│ A importância de:                       │
│   R$ 150,00 (cento e cinquenta reais)   │
│                                         │
│ Referente a:                            │
│   Plano mensal de treinamento — abril    │
│                                         │
│ Emitido por:                            │
│   {nome PT}                             │
│   CREF {numero/UF}                       │
│   {MEI/CNPJ}                            │
│                                         │
│ Pix txid: {ultimos 8}                    │
│ Pago em: DD/MM/AAAA HH:MM                │
│                                         │
│ Hash SHA-256 (integridade):              │
│ {primeiros 16}…{ultimos 16}             │
│                                         │
│ Gerado automaticamente por farpa Forte   │
└─────────────────────────────────────────┘
```

**Acessibilidade do PDF (A2.7):** tags estruturais, ordem lógica de leitura, alt em logo, cor de alta contraste.

**Bilinguismo:** template duplicado em EN (P4 Clara) — toggle na geração.

---

## 9. Métricas de saúde do módulo Pix

| Métrica | Alvo MVP |
|---|---|
| % de cobranças pagas ≤ 7d | ≥ 70% |
| Latency webhook → recibo p95 | ≤ 30s |
| Taxa de webhooks duplicados (idempotência) | 100% deduplicados (zero duplo recibo) |
| Tickets S1 de "pagou mas não chegou" | < 1% das cobranças pagas |
| % de PTs usando recurso Pix após 30d | ≥ 80% dos PTs ativos |

---

## 10. Riscos & mitigações

| Risco | Mitigação |
|---|---|
| PSP escolhido sair do ar | Arquitetura abstrai PSP · adapter pattern · swap documentado em runbook |
| Custo por transação crescer | CFO revisita em 90d · considera multi-PSP com routing |
| PT sem CNPJ/MEI querendo emitir recibo | Mensagem clara: "Recibo profissional exige CNPJ/MEI — você pode emitir manualmente" · oferece template simplificado como pessoa física |
| Fraude (chargeback-equivalente em Pix é MED) | Fora de escopo MVP · declarado no termo · PT assume relação com aluno |
| LGPD no armazenamento de PDFs | R2 com access logs · link curto expira · PDF criptografado no R2 (server-side) |

---

## 11. Open questions → F6 PRD

1. Escolha do PSP inicial (Inter · Efí · Mercado Pago · PagSeguro) — Super Backend + CFO decidem em F6.
2. Limite máximo por cobrança MVP (regulatório + antifraude simples).
3. Numeração de recibo por PT: reset anual ou contínuo?
4. Integração com NFS-e (pós-MVP · exige município-específico).

---

*F4 · Fluxos Pagamento Pix · farpa Forte · v1 · 2026-04-19*
