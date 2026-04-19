// forte-worker · routes/payments.ts · 2026-04-19
// E6 — Pix manual (ADR 016). billing_configs + pix_confirmations.
// QR code é gerado client-side (ADR 016). Backend emite payload BR Code + recibo.

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { randomId } from '../lib/crypto';
import { t, type Locale } from '../lib/i18n';

// BR Code (EMV Pix) payload builder — string que o frontend joga em qualquer lib QR.
// Spec simplificada: campos obrigatórios 00, 26 (GUI+chave), 52, 53, 54 opcional, 58, 59, 60, 62, 63.
// Para MVP, geramos payload estático (sem valor fixo) — aluno digita no app bancário.
function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}
function crc16(payload: string): string {
  let crc = 0xFFFF;
  for (const ch of payload) {
    crc ^= ch.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function buildPixBRCode(pixKey: string, merchant: string, amount?: number): string {
  const gui = tlv('00', 'br.gov.bcb.pix') + tlv('01', pixKey);
  const mai = tlv('26', gui);
  const parts = [
    tlv('00', '01'),
    mai,
    tlv('52', '0000'),
    tlv('53', '986'),
    amount ? tlv('54', amount.toFixed(2)) : '',
    tlv('58', 'BR'),
    tlv('59', merchant.slice(0, 25)),
    tlv('60', 'SAO PAULO'),
    tlv('62', tlv('05', '***')),
  ].join('');
  const toCrc = parts + '6304';
  return toCrc + crc16(toCrc);
}

function buildReceipt(locale: Locale, opts: { student_name: string; pt_name: string; amount: number; declared_at: number; reference: string }): string {
  const dt = new Date(opts.declared_at * 1000).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR');
  const amt = opts.amount.toFixed(2);
  return [
    t(locale, 'pix.receipt.header'),
    '',
    locale === 'en' ? `Student: ${opts.student_name}` : `Aluno: ${opts.student_name}`,
    locale === 'en' ? `Coach: ${opts.pt_name}`        : `Professor: ${opts.pt_name}`,
    locale === 'en' ? `Reference: ${opts.reference}`  : `Referência: ${opts.reference}`,
    locale === 'en' ? `Amount: BRL ${amt}`            : `Valor: R$ ${amt}`,
    locale === 'en' ? `Declared at: ${dt}`            : `Declarado em: ${dt}`,
    '',
    '— ' + t(locale, 'pix.receipt.disclaimer'),
  ].join('\n');
}

export async function handlePayments(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // GET /api/payments/pix/config?student_id=… — aluno busca chave + payload p/ gerar QR local
  if (path === '/api/payments/pix/config' && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    const student_id = url.searchParams.get('student_id');
    if (!student_id) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    const cfg = await env.DB.prepare(
      `SELECT bc.*, u.name as pt_name FROM billing_configs bc
       JOIN users u ON bc.professor_id=u.id
       WHERE bc.student_id=? AND bc.status='active'`
    ).bind(student_id).first() as {
      pix_key: string|null; pix_key_type: string|null; pt_name: string; billing_type: string;
      monthly_amount: number|null; package_amount: number|null;
    } | null;
    if (!cfg || !cfg.pix_key) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    const amount = cfg.billing_type === 'monthly' ? cfg.monthly_amount : cfg.package_amount;
    const brcode = buildPixBRCode(cfg.pix_key, cfg.pt_name, amount || undefined);

    return jsonResp({
      pix_key:       cfg.pix_key,
      pix_key_type:  cfg.pix_key_type,
      merchant_name: cfg.pt_name,
      amount,
      billing_type:  cfg.billing_type,
      brcode,                                    // frontend → qrcode.js → imagem
    }, 200, cors);
  }

  // POST /api/payments/pix/config — PT cadastra/atualiza chave + valores
  if (path === '/api/payments/pix/config' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const b = await request.json() as {
      student_id: string; billing_type: 'monthly'|'package';
      monthly_amount?: number; monthly_due_day?: number;
      package_session_count?: number; package_amount?: number; package_validity_days?: number;
      pix_key: string; pix_key_type: 'cpf'|'cnpj'|'email'|'phone'|'random';
    };
    if (!b.student_id || !b.billing_type || !b.pix_key) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    // desativa config anterior
    await env.DB.prepare(`UPDATE billing_configs SET status='archived', updated_at=unixepoch() WHERE student_id=? AND status='active'`).bind(b.student_id).run();

    const id = randomId(8);
    await env.DB.prepare(`INSERT INTO billing_configs
      (id,professor_id,student_id,billing_type,monthly_amount,monthly_due_day,package_session_count,package_amount,package_validity_days,sessions_remaining,pix_key,pix_key_type,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'active')`).bind(
      id, session.user_id, b.student_id, b.billing_type,
      b.monthly_amount ?? null, b.monthly_due_day ?? null,
      b.package_session_count ?? null, b.package_amount ?? null, b.package_validity_days ?? null,
      b.package_session_count ?? null,
      b.pix_key, b.pix_key_type
    ).run();

    return jsonResp({ ok: true, config_id: id }, 201, cors);
  }

  // POST /api/payments/pix/declare — aluno declara que pagou
  if (path === '/api/payments/pix/declare' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const b = await request.json() as { payment_id: string; amount: number; note?: string };
    if (!b.payment_id || !b.amount) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    const pay = await env.DB.prepare('SELECT professor_id, student_id FROM payments WHERE id=?').bind(b.payment_id).first() as { professor_id:string; student_id:string } | null;
    if (!pay) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    const exists = await env.DB.prepare(
      `SELECT id FROM pix_confirmations WHERE payment_id=? AND status IN ('pending','confirmed_by_pt')`
    ).bind(b.payment_id).first();
    if (exists) return jsonResp({ error: t(locale,'err.pix.already_confirmed') }, 409, cors);

    const id = randomId(8);
    await env.DB.prepare(`INSERT INTO pix_confirmations
      (id,payment_id,professor_id,student_id,amount_declared,student_note,status)
      VALUES (?,?,?,?,?,?, 'pending')`).bind(
      id, b.payment_id, pay.professor_id, pay.student_id, b.amount, b.note || null
    ).run();

    return jsonResp({ ok: true, confirmation_id: id, message: t(locale,'ok.pix.declared') }, 201, cors);
  }

  // POST /api/payments/pix/confirm — PT confirma recebimento → gera recibo
  if (path === '/api/payments/pix/confirm' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const b = await request.json() as { confirmation_id: string; decision: 'confirmed_by_pt'|'rejected_by_pt'; reason?: string };
    if (!b.confirmation_id || !b.decision) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    const conf = await env.DB.prepare(
      `SELECT pc.*, u.name as student_name, pu.name as pt_name, p.reference_month
       FROM pix_confirmations pc
       JOIN payments p ON pc.payment_id=p.id
       JOIN student_profiles sp ON pc.student_id=sp.id
       JOIN users u  ON sp.user_id=u.id
       JOIN users pu ON pc.professor_id=pu.id
       WHERE pc.id=? AND pc.professor_id=?`
    ).bind(b.confirmation_id, session.user_id).first() as {
      amount_declared:number; declared_at:number; student_name:string; pt_name:string; reference_month:string|null; payment_id:string;
    } | null;
    if (!conf) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    await env.DB.prepare(`UPDATE pix_confirmations SET status=?, pt_decision_at=unixepoch(), pt_decision_reason=? WHERE id=?`)
      .bind(b.decision, b.reason || null, b.confirmation_id).run();

    if (b.decision === 'confirmed_by_pt') {
      await env.DB.prepare(`UPDATE payments SET status='pago', paid_at=unixepoch(), method='pix' WHERE id=?`).bind(conf.payment_id).run();
    }

    const receipt = b.decision === 'confirmed_by_pt' ? buildReceipt(locale, {
      student_name: conf.student_name, pt_name: conf.pt_name,
      amount: conf.amount_declared, declared_at: conf.declared_at,
      reference: conf.reference_month || '—',
    }) : null;

    return jsonResp({
      ok: true,
      decision: b.decision,
      receipt,
      disclaimer: t(locale, 'pix.receipt.disclaimer'),
      message: b.decision === 'confirmed_by_pt' ? t(locale,'ok.pix.confirmed') : undefined,
    }, 200, cors);
  }

  return null;
}
