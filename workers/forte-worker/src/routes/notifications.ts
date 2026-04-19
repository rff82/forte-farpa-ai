// forte-worker · routes/notifications.ts · 2026-04-19
// E13 — Config de notificações + schedule (geração acontece em consumer/cron quando session vira 'confirmed').
// Envio real via Cloudflare Email Workers (processado em scheduled()/queue consumer — Onda B Turno 2 ou 3).

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { randomId } from '../lib/crypto';
import { t } from '../lib/i18n';

const DEFAULT_OFFSETS = [32, 24, 16, 8, 2];

export async function handleNotifications(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // GET /api/notifications/config — PT lê config (cria default se não existe)
  if (path === '/api/notifications/config' && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    let cfg = await env.DB.prepare('SELECT * FROM notification_configs WHERE professor_id=?').bind(session.user_id).first();
    if (!cfg) {
      const id = randomId(8);
      await env.DB.prepare(`INSERT INTO notification_configs
        (id,professor_id,email_enabled,sms_enabled,reminder_offsets_h,
         tpl_pt_email_subject,tpl_pt_email_body,tpl_student_email_subject,tpl_student_email_body)
        VALUES (?,?,1,0,?,?,?,?,?)`).bind(
        id, session.user_id, JSON.stringify(DEFAULT_OFFSETS),
        t(locale,'notif.email.pt.subject'),      t(locale,'notif.email.pt.body'),
        t(locale,'notif.email.session.subject'), t(locale,'notif.email.session.body'),
      ).run();
      cfg = await env.DB.prepare('SELECT * FROM notification_configs WHERE professor_id=?').bind(session.user_id).first();
    }
    return jsonResp(cfg, 200, cors);
  }

  // PUT /api/notifications/config — PT atualiza
  if (path === '/api/notifications/config' && request.method === 'PUT') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const b = await request.json() as {
      email_enabled?: number; sms_enabled?: number; reminder_offsets_h?: number[];
      tpl_pt_email_subject?: string; tpl_pt_email_body?: string;
      tpl_student_email_subject?: string; tpl_student_email_body?: string;
      quiet_hours_start?: number; quiet_hours_end?: number; timezone?: string;
    };

    await env.DB.prepare(`UPDATE notification_configs SET
      email_enabled=COALESCE(?,email_enabled),
      sms_enabled=COALESCE(?,sms_enabled),
      reminder_offsets_h=COALESCE(?,reminder_offsets_h),
      tpl_pt_email_subject=COALESCE(?,tpl_pt_email_subject),
      tpl_pt_email_body=COALESCE(?,tpl_pt_email_body),
      tpl_student_email_subject=COALESCE(?,tpl_student_email_subject),
      tpl_student_email_body=COALESCE(?,tpl_student_email_body),
      quiet_hours_start=COALESCE(?,quiet_hours_start),
      quiet_hours_end=COALESCE(?,quiet_hours_end),
      timezone=COALESCE(?,timezone),
      updated_at=unixepoch()
      WHERE professor_id=?`).bind(
      b.email_enabled ?? null, b.sms_enabled ?? null,
      b.reminder_offsets_h ? JSON.stringify(b.reminder_offsets_h) : null,
      b.tpl_pt_email_subject ?? null, b.tpl_pt_email_body ?? null,
      b.tpl_student_email_subject ?? null, b.tpl_student_email_body ?? null,
      b.quiet_hours_start ?? null, b.quiet_hours_end ?? null, b.timezone ?? null,
      session.user_id
    ).run();
    return jsonResp({ ok: true }, 200, cors);
  }

  // POST /api/notifications/schedule — gera lembretes para uma sessão (chamado ao confirm)
  if (path === '/api/notifications/schedule' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const b = await request.json() as { session_id: string };
    const sess = await env.DB.prepare(
      `SELECT s.*, sp.user_id as student_user_id FROM sessions_v2 s
       JOIN student_profiles sp ON s.student_id=sp.id
       WHERE s.id=?`
    ).bind(b.session_id).first() as { professor_id:string; student_user_id:string; scheduled_at:number } | null;
    if (!sess) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    const cfg = await env.DB.prepare('SELECT reminder_offsets_h, email_enabled FROM notification_configs WHERE professor_id=?')
      .bind(sess.professor_id).first() as { reminder_offsets_h:string; email_enabled:number } | null;
    const offsets: number[] = cfg ? JSON.parse(cfg.reminder_offsets_h) : DEFAULT_OFFSETS;

    let count = 0;
    for (const offset of offsets) {
      const send_at = sess.scheduled_at - (offset * 3600);
      if (send_at < Math.floor(Date.now()/1000)) continue;      // passou

      // PT
      await env.DB.prepare(`INSERT INTO notification_schedules
        (id,session_id,recipient_user,recipient_role,channel,send_at,offset_hours)
        VALUES (?,?,?, 'professor','email',?,?)`).bind(randomId(8), b.session_id, sess.professor_id, send_at, offset).run();
      // Aluno
      await env.DB.prepare(`INSERT INTO notification_schedules
        (id,session_id,recipient_user,recipient_role,channel,send_at,offset_hours)
        VALUES (?,?,?, 'aluno','email',?,?)`).bind(randomId(8), b.session_id, sess.student_user_id, send_at, offset).run();
      count += 2;
    }

    return jsonResp({ ok: true, scheduled: count }, 201, cors);
  }

  return null;
}
