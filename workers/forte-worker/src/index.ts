// forte-worker · src/index.ts · v1.0 · 2026-04-17
// farpa Forte — Personal Trainer Management API
// Cloudflare Workers · D1 + KV + AI · OAuth via admin.farpa.ai

export interface Env {
  DB:    D1Database;
  CACHE: KVNamespace;
  AI:    Ai;
  ENVIRONMENT:    string;
  PRODUCT_NAME:   string;
  CLIENT_ID:      string;
  ALLOWED_ORIGIN:       string;
  CLIENT_SECRET:        string;
  SESSION_COOKIE_SECRET: string;
}

const ALLOWED_ORIGINS = [
  'https://forte.farpa.ai',
  'https://farpa.ai',
  'https://admin.farpa.ai',
];

function corsHeaders(origin: string) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

function base64url(buf: Uint8Array): string {
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k,...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

async function requireSession(request: Request, env: Env): Promise<{ user_id: string; role: string } | null> {
  const sid = readCookie(request, 'forte_sid');
  if (!sid) return null;
  const raw = await env.CACHE.get(`session:${sid}`);
  return raw ? JSON.parse(raw) : null;
}

function jsonResp(data: unknown, status = 200, cors: Record<string,string> = {}) {
  return Response.json(data, { status, headers: cors });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin);
    const url    = new URL(request.url);
    const path   = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      // ── Public routes ──────────────────────────────────────────────

      if (path === '/health') {
        return jsonResp({ status: 'ok', product: 'forte', ts: Date.now() }, 200, cors);
      }

      // Login → redirect to admin.farpa.ai IdP
      if (path === '/login') {
        const state    = crypto.randomUUID();
        const nonce    = crypto.randomUUID();
        const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
        const challenge = base64url(new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
        ));
        await env.CACHE.put(`oauth:state:${state}`, JSON.stringify({ verifier, nonce }), { expirationTtl: 600 });
        const authorizeUrl = new URL('https://admin.farpa.ai/oauth/authorize');
        authorizeUrl.search = new URLSearchParams({
          client_id: env.CLIENT_ID,
          redirect_uri: 'https://forte.farpa.ai/auth/callback',
          response_type: 'code', scope: 'openid profile email',
          state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
        }).toString();
        return Response.redirect(authorizeUrl.toString(), 302);
      }

      // OAuth callback
      if (path === '/auth/callback') {
        const code  = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        if (!code || !state) return jsonResp({ error: 'missing params' }, 400, cors);
        const stateRaw = await env.CACHE.get(`oauth:state:${state}`);
        if (!stateRaw) return jsonResp({ error: 'state expired' }, 400, cors);
        await env.CACHE.delete(`oauth:state:${state}`);
        const { verifier } = JSON.parse(stateRaw);
        const tokenRes = await fetch('https://admin.farpa.ai/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type:'authorization_code', client_id: env.CLIENT_ID,
            client_secret: env.CLIENT_SECRET, code, redirect_uri:'https://forte.farpa.ai/auth/callback',
            code_verifier: verifier }).toString(),
        });
        if (!tokenRes.ok) return jsonResp({ error: 'token exchange failed' }, 401, cors);
        const { access_token, id_token, expires_in } = await tokenRes.json() as {access_token:string;id_token:string;expires_in:number};
        const sid = crypto.randomUUID();
        await env.CACHE.put(`session:${sid}`, JSON.stringify({ access_token, id_token }), { expirationTtl: Math.min(expires_in,3600) });
        const cookie = [`forte_sid=${sid}`,'Path=/','HttpOnly','Secure','SameSite=Lax',`Max-Age=${Math.min(expires_in,3600)}`].join('; ');
        return new Response(null, { status:302, headers: { Location:'/', 'Set-Cookie':cookie, ...cors } });
      }

      // Simple email/password login for MVP (antes do IdP estar pronto)
      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json() as { email: string; senha: string; role: string };
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND role = ?')
          .bind(body.email, body.role).first() as { id:string; role:string; name:string } | null;
        if (!user) return jsonResp({ error: 'invalid credentials' }, 401, cors);
        const sid = crypto.randomUUID();
        await env.CACHE.put(`session:${sid}`, JSON.stringify({ user_id: user.id, role: user.role, name: user.name }), { expirationTtl: 86400 });
        const cookie = [`forte_sid=${sid}`,'Path=/','HttpOnly','Secure','SameSite=Lax','Max-Age=86400'].join('; ');
        return new Response(JSON.stringify({ ok: true }), { status:200, headers: { 'Content-Type':'application/json', 'Set-Cookie':cookie, ...cors } });
      }

      // Logout
      if (path === '/logout') {
        const sid = readCookie(request, 'forte_sid');
        if (sid) await env.CACHE.delete(`session:${sid}`);
        return new Response(null, { status:302, headers: { Location:'/', 'Set-Cookie':'forte_sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0', ...cors } });
      }

      // ── Guard ──────────────────────────────────────────────────────
      const session = await requireSession(request, env);
      if (!session) return jsonResp({ error: 'unauthorized' }, 401, cors);

      // ── Professor routes ───────────────────────────────────────────

      if (path === '/api/professor/dashboard' && request.method === 'GET') {
        const [students, sessions, payments] = await Promise.all([
          env.DB.prepare('SELECT COUNT(*) as count FROM student_profiles WHERE professor_id = ? AND status = "ativo"').bind(session.user_id).first(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM sessions WHERE professor_id = ? AND scheduled_at >= ? AND scheduled_at < ?`)
            .bind(session.user_id, dayStart(), dayEnd()).first(),
          env.DB.prepare(`SELECT COUNT(*) as count, SUM(amount) as total FROM payments WHERE professor_id = ? AND status = "pendente"`)
            .bind(session.user_id).first(),
        ]);
        const revenueRow = await env.DB.prepare(`SELECT SUM(amount) as total FROM payments WHERE professor_id = ? AND status = "pago" AND paid_at >= ?`)
          .bind(session.user_id, monthStart()).first() as { total: number } | null;
        const sessionsToday = await env.DB.prepare(`
          SELECT s.*, sp.user_id as student_user_id, u.name as student_name
          FROM sessions s
          JOIN student_profiles sp ON s.student_id = sp.id
          JOIN users u ON sp.user_id = u.id
          WHERE s.professor_id = ? AND s.scheduled_at >= ? AND s.scheduled_at < ?
          ORDER BY s.scheduled_at`)
          .bind(session.user_id, dayStart(), dayEnd()).all();
        const recentStudents = await env.DB.prepare(`
          SELECT sp.*, u.name, u.email FROM student_profiles sp
          JOIN users u ON sp.user_id = u.id
          WHERE sp.professor_id = ? ORDER BY sp.created_at DESC LIMIT 5`)
          .bind(session.user_id).all();
        const pendingPayments = await env.DB.prepare(`
          SELECT p.*, u.name as student_name FROM payments p
          JOIN student_profiles sp ON p.student_id = sp.id
          JOIN users u ON sp.user_id = u.id
          WHERE p.professor_id = ? AND p.status != "pago" ORDER BY p.due_date LIMIT 5`)
          .bind(session.user_id).all();
        return jsonResp({
          active_students:      (students as {count:number})?.count ?? 0,
          sessions_total_today: (sessions as {count:number})?.count ?? 0,
          sessions_done_today:  0,
          monthly_revenue:      revenueRow?.total ?? 0,
          pending_payments_count: (payments as {count:number})?.count ?? 0,
          sessions_today:       sessionsToday.results,
          recent_students:      recentStudents.results,
          pending_payments:     pendingPayments.results,
        }, 200, cors);
      }

      if (path === '/api/professor/students') {
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(`
            SELECT sp.*, u.name, u.email, u.phone FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.professor_id = ? ORDER BY u.name`)
            .bind(session.user_id).all();
          return jsonResp(results, 200, cors);
        }
        if (request.method === 'POST') {
          const b = await request.json() as { name:string; email:string; phone?:string; objective?:string; plan_type?:string; sessions_per_week?:number; plan_value?:number; anamnese?: Record<string,unknown> };
          const userId = crypto.randomUUID().replace(/-/g,'').slice(0,16);
          await env.DB.prepare('INSERT INTO users (id,email,name,role,phone) VALUES (?,?,?,?,?)')
            .bind(userId, b.email, b.name, 'aluno', b.phone || null).run();
          const studentId = crypto.randomUUID().replace(/-/g,'').slice(0,16);
          await env.DB.prepare('INSERT INTO student_profiles (id,user_id,professor_id,objective,plan_type,sessions_per_week,plan_value) VALUES (?,?,?,?,?,?,?)')
            .bind(studentId, userId, session.user_id, b.objective||null, b.plan_type||'mensal', b.sessions_per_week||3, b.plan_value||0).run();
          if (b.anamnese) {
            const a = b.anamnese as { has_heart_issue?:number; has_hypertension?:number; has_diabetes?:number; has_joint_pain?:number; injuries?:string; observations?:string };
            await env.DB.prepare('INSERT INTO anamneses (id,student_id,has_heart_issue,has_hypertension,has_diabetes,has_joint_pain,injuries,observations) VALUES (?,?,?,?,?,?,?,?)')
              .bind(crypto.randomUUID().replace(/-/g,'').slice(0,16), studentId, a.has_heart_issue||0, a.has_hypertension||0, a.has_diabetes||0, a.has_joint_pain||0, a.injuries||null, a.observations||null).run();
          }
          return jsonResp({ ok:true, student_id: studentId }, 201, cors);
        }
      }

      if (path === '/api/professor/sessions') {
        if (request.method === 'GET') {
          const from = url.searchParams.get('from') || dayStart().toString();
          const to   = url.searchParams.get('to')   || dayEnd().toString();
          const { results } = await env.DB.prepare(`
            SELECT s.*, u.name as student_name FROM sessions s
            JOIN student_profiles sp ON s.student_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE s.professor_id = ? AND s.scheduled_at >= ? AND s.scheduled_at <= ?
            ORDER BY s.scheduled_at`)
            .bind(session.user_id, from, to).all();
          return jsonResp(results, 200, cors);
        }
        if (request.method === 'POST') {
          const b = await request.json() as { student_id:string; scheduled_at:number; duration_min?:number; notes?:string };
          const id = crypto.randomUUID().replace(/-/g,'').slice(0,16);
          await env.DB.prepare('INSERT INTO sessions (id,professor_id,student_id,scheduled_at,duration_min,notes) VALUES (?,?,?,?,?,?)')
            .bind(id, session.user_id, b.student_id, b.scheduled_at, b.duration_min||60, b.notes||null).run();
          return jsonResp({ ok:true, session_id: id }, 201, cors);
        }
      }

      const sessMatch = path.match(/^\/api\/professor\/sessions\/([^/]+)$/);
      if (sessMatch && request.method === 'PUT') {
        const b = await request.json() as { status?:string; notes?:string };
        await env.DB.prepare('UPDATE sessions SET status = ?, updated_at = unixepoch() WHERE id = ? AND professor_id = ?')
          .bind(b.status||'agendada', sessMatch[1], session.user_id).run();
        return jsonResp({ ok:true }, 200, cors);
      }

      if (path === '/api/professor/payments') {
        if (request.method === 'GET') {
          const month = url.searchParams.get('month') || '';
          const query = month
            ? 'SELECT p.*, u.name as student_name FROM payments p JOIN student_profiles sp ON p.student_id=sp.id JOIN users u ON sp.user_id=u.id WHERE p.professor_id=? AND p.reference_month=? ORDER BY p.due_date'
            : 'SELECT p.*, u.name as student_name FROM payments p JOIN student_profiles sp ON p.student_id=sp.id JOIN users u ON sp.user_id=u.id WHERE p.professor_id=? ORDER BY p.due_date DESC';
          const stmt = month
            ? env.DB.prepare(query).bind(session.user_id, month)
            : env.DB.prepare(query).bind(session.user_id);
          const { results } = await stmt.all();
          return jsonResp(results, 200, cors);
        }
        if (request.method === 'POST') {
          const b = await request.json() as { student_id:string; amount:number; due_date:number; reference_month?:string; method?:string; notes?:string };
          const id = crypto.randomUUID().replace(/-/g,'').slice(0,16);
          await env.DB.prepare('INSERT INTO payments (id,professor_id,student_id,amount,due_date,reference_month,method,notes) VALUES (?,?,?,?,?,?,?,?)')
            .bind(id, session.user_id, b.student_id, b.amount, b.due_date, b.reference_month||null, b.method||'pix', b.notes||null).run();
          return jsonResp({ ok:true, payment_id: id }, 201, cors);
        }
      }

      const pagMatch = path.match(/^\/api\/professor\/payments\/([^/]+)$/);
      if (pagMatch && request.method === 'PUT') {
        const b = await request.json() as { status?:string; paid_at?:number; method?:string };
        await env.DB.prepare('UPDATE payments SET status=?, paid_at=?, method=COALESCE(?,method) WHERE id=? AND professor_id=?')
          .bind(b.status||'pago', b.paid_at||Math.floor(Date.now()/1000), b.method||null, pagMatch[1], session.user_id).run();
        return jsonResp({ ok:true }, 200, cors);
      }

      // ── Student routes ─────────────────────────────────────────────

      if (path === '/api/student/dashboard' && request.method === 'GET') {
        const profile = await env.DB.prepare('SELECT sp.*, u.name FROM student_profiles sp JOIN users u ON sp.user_id=u.id WHERE sp.user_id=?')
          .bind(session.user_id).first() as { id:string; professor_id:string; name:string } | null;
        if (!profile) return jsonResp({ error: 'student not found' }, 404, cors);
        const nextSession = await env.DB.prepare('SELECT s.*, u.name as student_name FROM sessions s JOIN student_profiles sp ON s.student_id=sp.id JOIN users u ON sp.user_id=u.id WHERE s.student_id=? AND s.scheduled_at > ? ORDER BY s.scheduled_at LIMIT 1')
          .bind(profile.id, Math.floor(Date.now()/1000)).first();
        const lastMeasurement = await env.DB.prepare('SELECT * FROM body_measurements WHERE student_id=? ORDER BY measured_at DESC LIMIT 1')
          .bind(profile.id).first();
        const currentPayment = await env.DB.prepare('SELECT * FROM payments WHERE student_id=? ORDER BY due_date DESC LIMIT 1')
          .bind(profile.id).first();
        const sessionsMonth = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions WHERE student_id=? AND scheduled_at >= ? AND status="realizada"')
          .bind(profile.id, monthStart()).first() as { count:number } | null;
        return jsonResp({ profile, next_session: nextSession, last_measurement: lastMeasurement, current_payment: currentPayment, sessions_this_month: sessionsMonth?.count ?? 0 }, 200, cors);
      }

      if (path === '/api/student/measurements') {
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(`
            SELECT bm.* FROM body_measurements bm
            JOIN student_profiles sp ON bm.student_id=sp.id
            WHERE sp.user_id=? ORDER BY bm.measured_at`)
            .bind(session.user_id).all();
          return jsonResp(results, 200, cors);
        }
        if (request.method === 'POST') {
          const b = await request.json() as { measured_at?:number; weight_kg?:number; body_fat_pct?:number; chest_cm?:number; waist_cm?:number; hip_cm?:number; bicep_cm?:number; thigh_cm?:number; calf_cm?:number; notes?:string };
          const profile = await env.DB.prepare('SELECT id FROM student_profiles WHERE user_id=?').bind(session.user_id).first() as { id:string } | null;
          if (!profile) return jsonResp({ error:'profile not found' }, 404, cors);
          const id = crypto.randomUUID().replace(/-/g,'').slice(0,16);
          await env.DB.prepare('INSERT INTO body_measurements (id,student_id,weight_kg,body_fat_pct,chest_cm,waist_cm,hip_cm,bicep_cm,thigh_cm,calf_cm,notes,measured_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
            .bind(id, profile.id, b.weight_kg||null, b.body_fat_pct||null, b.chest_cm||null, b.waist_cm||null, b.hip_cm||null, b.bicep_cm||null, b.thigh_cm||null, b.calf_cm||null, b.notes||null, b.measured_at||Math.floor(Date.now()/1000)).run();
          return jsonResp({ ok:true }, 201, cors);
        }
      }

      // ── AI: sugestão de treino ─────────────────────────────────────

      if (path === '/ai/suggest-workout' && request.method === 'POST') {
        const b = await request.json() as { student_id?:string; profile?: Record<string,unknown> };
        const profile = b.profile || {};
        const prompt = `Você é um personal trainer especialista. Sugira um plano de treino semanal detalhado para um aluno com o seguinte perfil: ${JSON.stringify(profile)}. Inclua exercícios, séries, repetições e descanso. Seja objetivo e profissional.`;
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct' as Parameters<Ai['run']>[0], { prompt });
        return jsonResp(response, 200, cors);
      }

      return jsonResp({ error:'Not found' }, 404, cors);

    } catch (err) {
      return jsonResp({ error:'Internal error', ts: Date.now() }, 500, cors);
    }
  }
};

function dayStart() { const d = new Date(); d.setHours(0,0,0,0); return Math.floor(d.getTime()/1000); }
function dayEnd()   { const d = new Date(); d.setHours(23,59,59,0); return Math.floor(d.getTime()/1000); }
function monthStart() {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime()/1000);
}
