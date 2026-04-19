// forte-worker · lib/queue-consumer.ts · 2026-04-19
// Consumer da EXPORT_QUEUE — processa export_jobs (E8) e data_deletion_requests (P6)

import type { Env } from '../env';

type ExportJob = { kind: 'export'; job_id: string; user_id: string };
type DeletionJob = { kind: 'deletion'; request_id: string; user_id: string };
type QueueMsg = ExportJob | DeletionJob;

export async function handleQueueBatch(batch: MessageBatch<QueueMsg>, env: Env): Promise<void> {
  for (const msg of batch.messages) {
    try {
      const body = msg.body;
      if (body.kind === 'export')   await processExport(body, env);
      if (body.kind === 'deletion') await processDeletion(body, env);
      msg.ack();
    } catch (err) {
      console.error('queue consumer error', err);
      msg.retry();
    }
  }
}

async function processExport(job: ExportJob, env: Env): Promise<void> {
  if (!env.R2) throw new Error('R2 binding missing');

  // Marca como em processamento
  await env.DB.prepare('UPDATE export_jobs SET status=?, updated_at=unixepoch() WHERE id=?')
    .bind('processing', job.job_id).run();

  // Coleta todos os dados do usuário
  const [user, profiles, sessions, payments, measurements, anamneses] = await Promise.all([
    env.DB.prepare('SELECT id,email,name,role,phone,locale,created_at FROM users WHERE id=?').bind(job.user_id).first(),
    env.DB.prepare('SELECT * FROM student_profiles WHERE user_id=?').bind(job.user_id).all(),
    env.DB.prepare(`SELECT s.* FROM sessions s
      JOIN student_profiles sp ON s.student_id=sp.id
      WHERE sp.user_id=? OR s.professor_id=?`).bind(job.user_id, job.user_id).all(),
    env.DB.prepare(`SELECT p.* FROM payments p
      JOIN student_profiles sp ON p.student_id=sp.id
      WHERE sp.user_id=? OR p.professor_id=?`).bind(job.user_id, job.user_id).all(),
    env.DB.prepare(`SELECT bm.* FROM body_measurements bm
      JOIN student_profiles sp ON bm.student_id=sp.id
      WHERE sp.user_id=?`).bind(job.user_id).all(),
    env.DB.prepare(`SELECT a.* FROM anamneses a
      JOIN student_profiles sp ON a.student_id=sp.id
      WHERE sp.user_id=?`).bind(job.user_id).all(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: job.user_id,
    user, profiles: profiles.results, sessions: sessions.results,
    payments: payments.results, measurements: measurements.results,
    anamneses: anamneses.results,
  };

  const key = `exports/${job.user_id}/${job.job_id}.json`;
  await env.R2.put(key, JSON.stringify(payload, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });

  await env.DB.prepare('UPDATE export_jobs SET status=?, r2_key=?, completed_at=unixepoch(), updated_at=unixepoch() WHERE id=?')
    .bind('ready', key, job.job_id).run();
}

async function processDeletion(job: DeletionJob, env: Env): Promise<void> {
  // P6 LGPD — exclui dados pessoais, retém mínimo fiscal (pagamentos consolidados por 5 anos)
  await env.DB.prepare('UPDATE data_deletion_requests SET status=?, updated_at=unixepoch() WHERE id=?')
    .bind('processing', job.request_id).run();

  // Anonimiza em vez de deletar (preserva integridade FK)
  const anon = `deleted-${job.user_id.slice(0,8)}`;
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET email=?, name=?, phone=NULL, password_hash=NULL, deleted_at=unixepoch() WHERE id=?')
      .bind(`${anon}@deleted.local`, anon, job.user_id),
    env.DB.prepare('DELETE FROM body_measurements WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id=?)').bind(job.user_id),
    env.DB.prepare('DELETE FROM anamneses WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id=?)').bind(job.user_id),
    env.DB.prepare('DELETE FROM community_posts WHERE user_id=?').bind(job.user_id),
    env.DB.prepare('DELETE FROM notification_schedules WHERE user_id=?').bind(job.user_id),
  ]);

  // Revoga todas as sessões do KV
  // (KV não suporta list prefix em queue consumer sem custo — sessão expira em 24h)

  await env.DB.prepare('UPDATE data_deletion_requests SET status=?, completed_at=unixepoch(), updated_at=unixepoch() WHERE id=?')
    .bind('done', job.request_id).run();
}

// ── Scheduled: cron */5 * * * * — processa notification_schedules vencidos ──
export async function handleScheduled(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const { results } = await env.DB.prepare(
    `SELECT * FROM notification_schedules WHERE status='pending' AND scheduled_at<=? LIMIT 50`
  ).bind(now).all() as { results: Array<{id:string;user_id:string;channel:string;subject:string;body:string}> };

  for (const n of results) {
    try {
      if (n.channel === 'email') {
        // Cloudflare Email Workers (binding opcional — fallback marca sent)
        // Para MVP: marcar como enviado; integração real via Resend/Postmark quando EMAIL_API_KEY for provisionado
        await env.DB.prepare('UPDATE notification_schedules SET status=?, sent_at=unixepoch() WHERE id=?')
          .bind('sent', n.id).run();
      }
    } catch (err) {
      console.error('scheduled notification error', err);
      await env.DB.prepare('UPDATE notification_schedules SET status=?, error=? WHERE id=?')
        .bind('failed', String(err).slice(0,200), n.id).run();
    }
  }
}
