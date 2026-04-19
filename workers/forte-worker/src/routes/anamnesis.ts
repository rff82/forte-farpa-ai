// forte-worker · routes/anamnesis.ts · 2026-04-19
// E4 — Anamnese versionada CREF. Versão imutável após assinatura PT.
// Tabelas: anamneses (v1) + anamnesis_versions (v2).

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { randomId } from '../lib/crypto';
import { t } from '../lib/i18n';

type AnamnesisRow = {
  id:string; student_id:string; has_heart_issue:number; has_hypertension:number;
  has_diabetes:number; has_joint_pain:number; injuries:string|null; observations:string|null;
  signed_by_pt_at?: number|null; signed_by_pt_user_id?: string|null;
};

export async function handleAnamnesis(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // POST /api/anamnesis — cria ou atualiza (só se não assinada) + snapshot em anamnesis_versions
  if (path === '/api/anamnesis' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const b = await request.json() as {
      anamnesis_id?: string;   // se presente = update; senão = create
      student_id:    string;
      has_heart_issue?: number; has_hypertension?: number;
      has_diabetes?: number;   has_joint_pain?: number;
      injuries?: string;       observations?: string;
      change_reason?: string;
    };
    if (!b.student_id) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    let current: AnamnesisRow | null = null;
    if (b.anamnesis_id) {
      current = await env.DB.prepare('SELECT * FROM anamneses WHERE id=?').bind(b.anamnesis_id).first() as AnamnesisRow | null;
      if (!current) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);
      if (current.signed_by_pt_at) {
        return jsonResp({ error: t(locale,'err.anamnesis.signed_immutable'), signed_at: current.signed_by_pt_at }, 409, cors);
      }
    }

    const id = b.anamnesis_id || randomId(8);
    if (current) {
      await env.DB.prepare(`UPDATE anamneses SET
        has_heart_issue=?, has_hypertension=?, has_diabetes=?, has_joint_pain=?,
        injuries=?, observations=?, updated_at=unixepoch() WHERE id=?`).bind(
        b.has_heart_issue ?? current.has_heart_issue,
        b.has_hypertension ?? current.has_hypertension,
        b.has_diabetes ?? current.has_diabetes,
        b.has_joint_pain ?? current.has_joint_pain,
        b.injuries ?? current.injuries,
        b.observations ?? current.observations,
        id
      ).run();
    } else {
      await env.DB.prepare(`INSERT INTO anamneses
        (id,student_id,has_heart_issue,has_hypertension,has_diabetes,has_joint_pain,injuries,observations)
        VALUES (?,?,?,?,?,?,?,?)`).bind(
        id, b.student_id,
        b.has_heart_issue ?? 0, b.has_hypertension ?? 0,
        b.has_diabetes ?? 0, b.has_joint_pain ?? 0,
        b.injuries ?? null, b.observations ?? null
      ).run();
    }

    // Snapshot imutável
    const fresh = await env.DB.prepare('SELECT * FROM anamneses WHERE id=?').bind(id).first();
    const lastVer = await env.DB.prepare(
      'SELECT COALESCE(MAX(version_number),0) as v FROM anamnesis_versions WHERE anamnesis_id=?'
    ).bind(id).first() as { v: number };
    await env.DB.prepare(`INSERT INTO anamnesis_versions
      (id,anamnesis_id,student_id,version_number,snapshot_json,changed_by_user_id,change_reason)
      VALUES (?,?,?,?,?,?,?)`).bind(
      randomId(8), id, b.student_id, (lastVer.v || 0) + 1,
      JSON.stringify(fresh), session.user_id, b.change_reason || null
    ).run();

    return jsonResp({ ok: true, anamnesis_id: id, version: (lastVer.v || 0) + 1, message: t(locale,'ok.anamnesis.created') }, 201, cors);
  }

  // POST /api/anamnesis/:id/sign — PT assina (torna imutável)
  const signMatch = path.match(/^\/api\/anamnesis\/([^/]+)\/sign$/);
  if (signMatch && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const id = signMatch[1];
    const row = await env.DB.prepare('SELECT * FROM anamneses WHERE id=?').bind(id).first() as AnamnesisRow | null;
    if (!row) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);
    if (row.signed_by_pt_at) return jsonResp({ error: t(locale,'err.anamnesis.signed_immutable') }, 409, cors);

    await env.DB.prepare(
      'UPDATE anamneses SET signed_by_pt_at=unixepoch(), signed_by_pt_user_id=? WHERE id=?'
    ).bind(session.user_id, id).run();

    return jsonResp({ ok: true, message: t(locale,'ok.anamnesis.signed') }, 200, cors);
  }

  // GET /api/anamnesis/:id — retorna atual + histórico
  const getMatch = path.match(/^\/api\/anamnesis\/([^/]+)$/);
  if (getMatch && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const id = getMatch[1];
    const current = await env.DB.prepare('SELECT * FROM anamneses WHERE id=?').bind(id).first();
    if (!current) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);
    const { results: versions } = await env.DB.prepare(
      'SELECT version_number, changed_by_user_id, change_reason, created_at FROM anamnesis_versions WHERE anamnesis_id=? ORDER BY version_number DESC'
    ).bind(id).all();

    return jsonResp({ current, versions }, 200, cors);
  }

  return null; // not handled
}
