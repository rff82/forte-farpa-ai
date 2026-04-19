// forte-worker · routes/ai.ts · 2026-04-19
// E5 — POST /api/ai/prescribe: dual-tier Workers AI → Gemini, sempre rascunho p/ revisão PT.
// PT só publica ao aluno após set pt_reviewed=1 + pt_published_at.

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { prescribeDualTier, type AnamneseSnapshot } from '../lib/ai';
import { t } from '../lib/i18n';
import { randomId } from '../lib/crypto';

export async function handleAI(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // POST /api/ai/prescribe
  if (path === '/api/ai/prescribe' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const b = await request.json() as {
      student_id:            string;
      anamnesis_version_id?: string;   // opcional: travar a prescrição a uma versão assinada
      objective:             string;
      sessions_per_week:     number;
      history_summary?:      string;
    };
    if (!b.student_id || !b.objective || !b.sessions_per_week) {
      return jsonResp({ error: t(locale,'err.validation') }, 400, cors);
    }

    // Busca snapshot da anamnese (versão travada ou atual)
    let anamnese: AnamneseSnapshot = {};
    if (b.anamnesis_version_id) {
      const ver = await env.DB.prepare('SELECT snapshot_json FROM anamnesis_versions WHERE id=?')
        .bind(b.anamnesis_version_id).first() as { snapshot_json: string } | null;
      if (ver) anamnese = JSON.parse(ver.snapshot_json) as AnamneseSnapshot;
    } else {
      const row = await env.DB.prepare('SELECT * FROM anamneses WHERE student_id=? ORDER BY created_at DESC LIMIT 1')
        .bind(b.student_id).first() as AnamneseSnapshot | null;
      if (row) anamnese = row;
    }

    // Alias anônimo para não vazar nome real ao LLM
    const student_alias = `aluno_${b.student_id.slice(0, 6)}`;

    try {
      const result = await prescribeDualTier(env, {
        professor_id: session.user_id,
        student_id:   b.student_id,
        context:      'workout_plan',
        input: {
          student_alias,
          objective:         b.objective,
          sessions_per_week: b.sessions_per_week,
          anamnese,
          history_summary:   b.history_summary,
          locale,
        },
      });

      // Cria workout_plans em DRAFT (pt_reviewed=0), ligado ao audit
      const plan_id = randomId(8);
      await env.DB.prepare(`INSERT INTO workout_plans (id, professor_id, student_id, title, content, status, ia_generated, ia_audit_id, ia_editada_pct, created_at)
        VALUES (?, ?, ?, ?, ?, 'draft', 1, ?, 0, unixepoch())`).bind(
        plan_id, session.user_id, b.student_id,
        `${locale === 'en' ? 'AI draft' : 'Rascunho IA'} — ${b.objective}`,
        result.text, result.audit_id
      ).run().catch(() => { /* se workout_plans não tiver essas colunas no v1, ignora */ });

      // Liga audit ao output
      await env.DB.prepare('UPDATE ia_audit_log SET output_ref_table=?, output_ref_id=? WHERE id=?')
        .bind('workout_plans', plan_id, result.audit_id).run();

      return jsonResp({
        ok:              true,
        plan_id,
        draft_text:      result.text,
        tier_used:       result.tier_used,
        model_id:        result.model_id,
        cached:          result.cached,
        tier1_failed:    result.tier1_failed,
        audit_id:        result.audit_id,
        pt_review_required: true,
        message:         t(locale, 'ok.ai.queued_for_review'),
      }, 200, cors);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.startsWith('both_tiers_failed') || msg.startsWith('tier1_failed_no_tier2')) {
        return jsonResp({ error: t(locale,'err.ai.both_tiers_failed'), detail: msg }, 503, cors);
      }
      throw err;
    }
  }

  // POST /api/ai/prescribe/:plan_id/review — PT aprova/edita antes de publicar
  const reviewMatch = path.match(/^\/api\/ai\/prescribe\/([^/]+)\/review$/);
  if (reviewMatch && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const plan_id = reviewMatch[1];
    const b = await request.json() as {
      edited_text?:     string;
      publish?:         boolean;
      audit_id:         string;
      ia_editada_pct?:  number;   // frontend calcula comparando original vs edited
    };

    if (b.edited_text) {
      await env.DB.prepare('UPDATE workout_plans SET content=?, status=?, updated_at=unixepoch() WHERE id=? AND professor_id=?')
        .bind(b.edited_text, b.publish ? 'published' : 'draft', plan_id, session.user_id).run();
    } else if (b.publish) {
      await env.DB.prepare('UPDATE workout_plans SET status=?, updated_at=unixepoch() WHERE id=? AND professor_id=?')
        .bind('published', plan_id, session.user_id).run();
    }

    await env.DB.prepare(`UPDATE ia_audit_log SET
      pt_reviewed=1, pt_edited=?, ia_editada_pct=COALESCE(?, ia_editada_pct), published_at=?
      WHERE id=?`).bind(
      b.edited_text ? 1 : 0,
      b.ia_editada_pct ?? null,
      b.publish ? Math.floor(Date.now()/1000) : null,
      b.audit_id
    ).run().catch(() => { /* coluna ia_editada_pct pode não existir no schema; ignora */ });

    return jsonResp({ ok: true, published: !!b.publish }, 200, cors);
  }

  return null;
}
