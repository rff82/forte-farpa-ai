// forte-worker · routes/gdpr.ts · 2026-04-19
// E8 — LGPD export assíncrono (Cloudflare Queues → R2) + token HMAC one-shot.
// P6 — LGPD delete granular com disclosure obrigatório + retenção histórico PT.

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { randomId, hmacSign, hmacVerify } from '../lib/crypto';
import { t } from '../lib/i18n';

// Tabelas retidas mesmo em delete (histórico profissional do PT + fiscal 5y)
const RETAINED_FIELDS = {
  users:    ['id','name','role','created_at'],       // nome + datas
  sessions: ['id','scheduled_at','status'],          // histórico de aulas
  payments: ['id','amount','due_date','paid_at','status','reference_month'], // anonimizado (5y fiscal)
};

export async function handleGDPR(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // GET /api/gdpr/disclosure — frontend exibe antes de qualquer delete
  if (path === '/api/gdpr/disclosure' && request.method === 'GET') {
    return jsonResp({
      title: t(locale, 'disclosure.retention.title'),
      body:  t(locale, 'disclosure.retention.body'),
      retained_fields: RETAINED_FIELDS,
    }, 200, cors);
  }

  // POST /api/gdpr/export — enfileira export
  if (path === '/api/gdpr/export' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const b = await request.json().catch(() => ({})) as { scope?: string };
    const id = randomId(8);
    await env.DB.prepare(`INSERT INTO export_jobs
      (id,requested_by,subject_user_id,kind,scope,status)
      VALUES (?,?,?, 'export',?, 'queued')`).bind(
      id, session.user_id, session.user_id, b.scope || 'all'
    ).run();

    // Enfileira se EXPORT_QUEUE existir; senão marca para processamento via cron scheduled()
    if (env.EXPORT_QUEUE) {
      await env.EXPORT_QUEUE.send({ job_id: id, kind: 'export', user_id: session.user_id });
    }

    return jsonResp({ ok: true, job_id: id, message: t(locale, 'ok.export.queued') }, 202, cors);
  }

  // GET /api/gdpr/export/:id — status + download url quando ready
  const statusMatch = path.match(/^\/api\/gdpr\/export\/([^/]+)$/);
  if (statusMatch && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const job = await env.DB.prepare('SELECT * FROM export_jobs WHERE id=? AND subject_user_id=?')
      .bind(statusMatch[1], session.user_id).first() as {
        id:string; status:string; r2_key:string|null; download_expires:number|null;
      } | null;
    if (!job) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    let download_url: string | null = null;
    if (job.status === 'ready' && job.r2_key && env.EXPORT_HMAC_SECRET) {
      const exp = Math.floor(Date.now()/1000) + 600;   // 10 min one-shot
      const payload = `${job.id}:${exp}`;
      const sig = await hmacSign(env.EXPORT_HMAC_SECRET, payload);
      download_url = `/api/gdpr/export/${job.id}/download?exp=${exp}&sig=${sig}`;
    }

    return jsonResp({ job_id: job.id, status: job.status, download_url }, 200, cors);
  }

  // GET /api/gdpr/export/:id/download — verifica HMAC, stream R2, invalida
  const dlMatch = path.match(/^\/api\/gdpr\/export\/([^/]+)\/download$/);
  if (dlMatch && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (!env.EXPORT_HMAC_SECRET || !env.R2) return jsonResp({ error: t(locale,'err.internal') }, 500, cors);

    const exp = url.searchParams.get('exp');
    const sig = url.searchParams.get('sig');
    if (!exp || !sig) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);
    if (Number(exp) < Math.floor(Date.now()/1000)) return jsonResp({ error: t(locale,'err.validation') }, 410, cors);

    const ok = await hmacVerify(env.EXPORT_HMAC_SECRET, `${dlMatch[1]}:${exp}`, sig);
    if (!ok) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const job = await env.DB.prepare('SELECT * FROM export_jobs WHERE id=? AND subject_user_id=?')
      .bind(dlMatch[1], session.user_id).first() as { r2_key: string|null; status: string } | null;
    if (!job || job.status !== 'ready' || !job.r2_key) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    const obj = await env.R2.get(job.r2_key);
    if (!obj) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    await env.DB.prepare(`UPDATE export_jobs SET status='delivered', delivered_at=unixepoch() WHERE id=?`).bind(dlMatch[1]).run();

    return new Response(obj.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="forte-export-${dlMatch[1]}.json"`,
        ...cors,
      },
    });
  }

  // POST /api/gdpr/delete — P6. scope_json + disclosure obrigatório
  if (path === '/api/gdpr/delete' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const b = await request.json() as {
      scope:                { anamnese?: boolean; medidas?: boolean; comunidade?: boolean; conta?: boolean };
      disclosure_confirmed: boolean;
    };
    if (!b.disclosure_confirmed) return jsonResp({ error: t(locale,'err.lgpd.disclosure_required') }, 400, cors);

    const sp = await env.DB.prepare('SELECT professor_id FROM student_profiles WHERE user_id=?').bind(session.user_id).first() as { professor_id: string } | null;

    const id = randomId(8);
    await env.DB.prepare(`INSERT INTO data_deletion_requests
      (id,user_id,professor_id,scope_json,retained_fields_json,disclosure_shown_at,status)
      VALUES (?,?,?,?,?, unixepoch(), 'pending')`).bind(
      id, session.user_id, sp?.professor_id || null,
      JSON.stringify(b.scope),
      JSON.stringify({
        nome:                 'historico_pt',
        sessions_dates:       'historico_pt',
        payments_anonimizados:'fiscal_5y',
      })
    ).run();

    // Liga um export_job de 'delete' kind para executar async
    const export_job_id = randomId(8);
    await env.DB.prepare(`INSERT INTO export_jobs
      (id,requested_by,subject_user_id,kind,scope,status)
      VALUES (?,?,?, 'delete',?, 'queued')`).bind(
      export_job_id, session.user_id, session.user_id, JSON.stringify(b.scope)
    ).run();
    await env.DB.prepare('UPDATE data_deletion_requests SET export_job_id=? WHERE id=?').bind(export_job_id, id).run();

    if (env.EXPORT_QUEUE) {
      await env.EXPORT_QUEUE.send({ job_id: export_job_id, kind: 'delete', user_id: session.user_id, scope: b.scope });
    }

    return jsonResp({ ok: true, request_id: id, message: t(locale,'ok.delete.queued') }, 202, cors);
  }

  return null;
}
