// forte-worker · routes/community.ts · 2026-04-19
// E7 — Comunidade 3 níveis: default OFF · killswitch global PT · opt-in por aluno.

import type { Env } from '../env';
import { jsonResp, detectLocale } from '../lib/http';
import { requireSession } from '../lib/session';
import { randomId } from '../lib/crypto';
import { t } from '../lib/i18n';

// Killswitch está em notification_configs? Não — vamos usar KV key `community:enabled:{professor_id}`.
async function isCommunityEnabled(env: Env, professor_id: string): Promise<boolean> {
  const v = await env.CACHE.get(`community:enabled:${professor_id}`);
  return v === '1';
}

export async function handleCommunity(request: Request, env: Env, url: URL, cors: Record<string,string>): Promise<Response|null> {
  const path   = url.pathname;
  const locale = detectLocale(request);

  // POST /api/community/toggle — PT liga/desliga comunidade (killswitch nível 1)
  if (path === '/api/community/toggle' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);
    if (session.role !== 'professor') return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);

    const b = await request.json() as { enabled: boolean };
    await env.CACHE.put(`community:enabled:${session.user_id}`, b.enabled ? '1' : '0');

    // Auto-enrola PT como owner ao ativar
    if (b.enabled) {
      const existing = await env.DB.prepare('SELECT id FROM community_members WHERE professor_id=? AND user_id=?')
        .bind(session.user_id, session.user_id).first();
      if (!existing) {
        await env.DB.prepare(`INSERT INTO community_members (id,professor_id,user_id,role) VALUES (?,?,?, 'owner')`)
          .bind(randomId(8), session.user_id, session.user_id).run();
      }
    }
    return jsonResp({ ok: true, enabled: b.enabled }, 200, cors);
  }

  // GET /api/community/status — frontend usa para esconder a tab
  if (path === '/api/community/status' && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    // descobre professor do aluno
    let professor_id: string | null = null;
    if (session.role === 'professor') professor_id = session.user_id;
    else {
      const sp = await env.DB.prepare('SELECT professor_id FROM student_profiles WHERE user_id=?').bind(session.user_id).first() as { professor_id: string } | null;
      professor_id = sp?.professor_id || null;
    }
    if (!professor_id) return jsonResp({ enabled: false, member: false }, 200, cors);

    const enabled = await isCommunityEnabled(env, professor_id);
    const member = await env.DB.prepare('SELECT role FROM community_members WHERE professor_id=? AND user_id=?')
      .bind(professor_id, session.user_id).first() as { role: string } | null;

    return jsonResp({ enabled, member: !!member, role: member?.role || null }, 200, cors);
  }

  // POST /api/community/join — aluno opt-in (nível 3)
  if (path === '/api/community/join' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const sp = await env.DB.prepare('SELECT professor_id FROM student_profiles WHERE user_id=?').bind(session.user_id).first() as { professor_id: string } | null;
    if (!sp) return jsonResp({ error: t(locale,'err.not_found') }, 404, cors);

    if (!await isCommunityEnabled(env, sp.professor_id)) {
      return jsonResp({ error: t(locale,'err.community.off') }, 403, cors);
    }

    const existing = await env.DB.prepare('SELECT id FROM community_members WHERE professor_id=? AND user_id=?')
      .bind(sp.professor_id, session.user_id).first();
    if (existing) return jsonResp({ ok: true, already_member: true }, 200, cors);

    await env.DB.prepare(`INSERT INTO community_members (id,professor_id,user_id,role) VALUES (?,?,?, 'member')`)
      .bind(randomId(8), sp.professor_id, session.user_id).run();
    return jsonResp({ ok: true }, 201, cors);
  }

  // POST /api/community/leave — aluno sai
  if (path === '/api/community/leave' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    await env.DB.prepare(`DELETE FROM community_members WHERE user_id=? AND role NOT IN ('owner')`).bind(session.user_id).run();
    return jsonResp({ ok: true }, 200, cors);
  }

  // GET /api/community/posts
  if (path === '/api/community/posts' && request.method === 'GET') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    // precisa ser member
    const m = await env.DB.prepare('SELECT professor_id, role FROM community_members WHERE user_id=?').bind(session.user_id).first() as { professor_id:string; role:string } | null;
    if (!m) return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);
    if (!await isCommunityEnabled(env, m.professor_id)) return jsonResp({ error: t(locale,'err.community.off') }, 403, cors);

    const { results } = await env.DB.prepare(
      `SELECT cp.*, u.name as author_name FROM community_posts cp
       JOIN users u ON cp.author_id=u.id
       WHERE cp.professor_id=? AND cp.status='published'
       ORDER BY cp.pinned DESC, cp.created_at DESC LIMIT 50`
    ).bind(m.professor_id).all();
    return jsonResp(results, 200, cors);
  }

  // POST /api/community/posts — criar
  if (path === '/api/community/posts' && request.method === 'POST') {
    const session = await requireSession(request, env);
    if (!session) return jsonResp({ error: t(locale,'err.unauthorized') }, 401, cors);

    const m = await env.DB.prepare('SELECT professor_id, role FROM community_members WHERE user_id=?').bind(session.user_id).first() as { professor_id:string; role:string } | null;
    if (!m) return jsonResp({ error: t(locale,'err.forbidden') }, 403, cors);
    if (!await isCommunityEnabled(env, m.professor_id)) return jsonResp({ error: t(locale,'err.community.off') }, 403, cors);

    const b = await request.json() as { title?: string; body: string; visibility?: 'members'|'professor_only'|'public'; pinned?: boolean };
    if (!b.body) return jsonResp({ error: t(locale,'err.validation') }, 400, cors);

    const id = randomId(8);
    const canPin = m.role === 'owner' || m.role === 'moderator';
    await env.DB.prepare(`INSERT INTO community_posts (id,professor_id,author_id,title,body,visibility,pinned,status)
      VALUES (?,?,?,?,?,?,?, 'published')`).bind(
      id, m.professor_id, session.user_id,
      b.title || null, b.body, b.visibility || 'members',
      canPin && b.pinned ? 1 : 0
    ).run();
    return jsonResp({ ok: true, post_id: id }, 201, cors);
  }

  return null;
}
