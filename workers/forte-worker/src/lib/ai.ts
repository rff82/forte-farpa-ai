// forte-worker · lib/ai.ts · 2026-04-19
// Super AI — prompts CREF-compliant + redactor PII + dual-tier (Workers AI → Gemini)
// Cache via KV (prompt_hash); audit em ia_audit_log.

import type { Env } from '../env';
import { sha256Hex, randomId } from './crypto';

const WORKERS_AI_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const GEMINI_MODEL     = 'gemini-2.0-flash';
const CACHE_TTL_S      = 60 * 60 * 24 * 7;  // 7 dias

// ── PII redactor (U5 LGPD + CREF ética) ──
// Remove CPF, email, telefone, nomes próprios antes de enviar ao LLM externo.
export function redactPII(text: string): string {
  return text
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,                 '[CPF_REDACTED]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g,                         '[EMAIL_REDACTED]')
    .replace(/\b(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/g,    '[PHONE_REDACTED]');
}

export interface AnamneseSnapshot {
  has_heart_issue?: number; has_hypertension?: number;
  has_diabetes?: number;    has_joint_pain?: number;
  injuries?: string|null;   observations?: string|null;
}

export interface PrescribeInput {
  student_alias:     string;            // nunca nome real — o caller passa alias
  objective:         string;
  sessions_per_week: number;
  anamnese:          AnamneseSnapshot;
  history_summary?:  string;
  locale:            'pt-BR' | 'en';
}

// ── Prompt CREF-compliant ──
// Estrutura: System (papel + limites) + User (dados redacted) — força recomendação de PT humano revisar.
export function buildPrescriptionPrompt(input: PrescribeInput): string {
  const a = input.anamnese;
  const restricoes = [
    a.has_heart_issue  ? (input.locale === 'en' ? 'cardiac issue' : 'questão cardíaca')    : null,
    a.has_hypertension ? (input.locale === 'en' ? 'hypertension'  : 'hipertensão')         : null,
    a.has_diabetes     ? (input.locale === 'en' ? 'diabetes'      : 'diabetes')            : null,
    a.has_joint_pain   ? (input.locale === 'en' ? 'joint pain'    : 'dor articular')       : null,
  ].filter(Boolean).join(', ') || (input.locale === 'en' ? 'none reported' : 'nenhuma relatada');

  const lesoes     = redactPII(a.injuries     || '');
  const observ     = redactPII(a.observations || '');
  const historico  = redactPII(input.history_summary || '');

  if (input.locale === 'en') {
    return `You are a certified strength & conditioning assistant generating a DRAFT training plan to be REVIEWED by a licensed personal trainer (CREF in Brazil). Never prescribe dose, volume or intensity that ignores contraindications. If a red flag is present, recommend medical clearance before progressing.

Student (alias): ${input.student_alias}
Primary objective: ${input.objective}
Sessions per week: ${input.sessions_per_week}
Medical restrictions: ${restricoes}
Reported injuries: ${lesoes || 'none'}
Coach notes: ${observ || 'none'}
Prior program summary: ${historico || 'n/a'}

Output format (markdown):
1. Weekly split (Day A/B/C…), one line each.
2. For each day: 5-6 exercises with sets × reps × rest, using conservative starting loads.
3. Substitution suggestions for each exercise respecting the restrictions above.
4. "⚠ Red flags detected" section listing any contraindication that warrants coach/physician attention.
5. "Coach review checklist" — 3 items the PT must verify before publishing to the student.

Do not invent names, numbers, CPFs, phone numbers, or emails. Stay within evidence-based strength training.`;
  }

  return `Você é um assistente de condicionamento físico gerando um RASCUNHO de plano de treino a ser REVISADO por um personal trainer licenciado (CREF). Nunca prescreva dose, volume ou intensidade ignorando contraindicações. Se houver red flag, recomende liberação médica antes de progredir.

Aluno (alias): ${input.student_alias}
Objetivo principal: ${input.objective}
Sessões por semana: ${input.sessions_per_week}
Restrições médicas: ${restricoes}
Lesões relatadas: ${lesoes || 'nenhuma'}
Observações do professor: ${observ || 'nenhuma'}
Resumo de histórico anterior: ${historico || 'n/d'}

Formato de saída (markdown):
1. Divisão semanal (Dia A/B/C…), uma linha cada.
2. Para cada dia: 5-6 exercícios com séries × repetições × descanso, cargas iniciais conservadoras.
3. Sugestão de substituição para cada exercício respeitando as restrições acima.
4. Seção "⚠ Red flags detectadas" listando qualquer contraindicação que mereça atenção do PT ou médico.
5. "Checklist de revisão do PT" — 3 itens que o professor deve verificar antes de publicar ao aluno.

Não invente nomes, números, CPFs, telefones ou emails. Mantenha-se em treinamento de força baseado em evidência.`;
}

// ── Tier 1: Cloudflare Workers AI ──
async function runWorkersAI(env: Env, prompt: string): Promise<{ text: string; ms: number }> {
  const t0 = Date.now();
  const resp = await env.AI.run(WORKERS_AI_MODEL as Parameters<Ai['run']>[0], { prompt, max_tokens: 1024 });
  const r = resp as { response?: string };
  return { text: r?.response || '', ms: Date.now() - t0 };
}

// ── Tier 2: Gemini (fallback) ──
async function runGemini(env: Env, prompt: string): Promise<{ text: string; ms: number }> {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  const t0  = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`gemini http ${res.status}`);
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  return { text, ms: Date.now() - t0 };
}

export interface PrescribeResult {
  text:          string;
  tier_used:     'workers_ai' | 'gemini';
  model_id:      string;
  prompt_hash:   string;
  cached:        boolean;
  latency_ms:    number;
  tier1_failed:  boolean;
  tier1_error?:  string;
  audit_id:      string;
}

// ── Heurística de "score" simples para decidir fallback ──
// Tier 1 é considerado "baixa confiança" se output < 200 chars ou não contém "Dia"/"Day" ou "×".
function tier1LooksWeak(text: string): boolean {
  if (text.length < 200) return true;
  const hasStructure = /(^|\n)\s*(Dia|Day)\s+[ABC]/i.test(text);
  const hasSets      = /×|x\s?\d|\d+\s?x\s?\d+/i.test(text);
  return !hasStructure || !hasSets;
}

export async function prescribeDualTier(
  env: Env,
  opts: {
    input:        PrescribeInput;
    professor_id: string;
    student_id?:  string;
    context?:     'workout_plan' | 'anamnesis_summary' | 'session_notes' | 'other';
  }
): Promise<PrescribeResult> {
  const prompt      = buildPrescriptionPrompt(opts.input);
  const prompt_hash = await sha256Hex(prompt);
  const context     = opts.context || 'workout_plan';

  // Cache hit?
  const cacheKey    = `ai:prescribe:${prompt_hash}`;
  const cached      = await env.CACHE.get(cacheKey);
  if (cached) {
    const c = JSON.parse(cached) as { text: string; tier_used: 'workers_ai'|'gemini'; model_id: string };
    const audit_id = randomId(8);
    await env.DB.prepare(`INSERT INTO ia_audit_log
      (id,professor_id,student_id,context,tier_used,model_id,prompt_hash,latency_ms,tier1_failed,fallback_reason,pt_reviewed)
      VALUES (?,?,?,?,?,?,?,?,?,?,0)`).bind(
      audit_id, opts.professor_id, opts.student_id || null, context,
      c.tier_used, c.model_id, prompt_hash, 0, 0, 'cache_hit'
    ).run();
    return {
      text: c.text, tier_used: c.tier_used, model_id: c.model_id,
      prompt_hash, cached: true, latency_ms: 0, tier1_failed: false, audit_id
    };
  }

  // Tier 1
  let tier1_error: string | undefined;
  let tier1_failed = false;
  let text = '';
  let tier_used: 'workers_ai' | 'gemini' = 'workers_ai';
  let model_id = WORKERS_AI_MODEL;
  let latency_ms = 0;
  let fallback_reason: string | null = null;

  try {
    const r = await runWorkersAI(env, prompt);
    text       = r.text;
    latency_ms = r.ms;
    if (tier1LooksWeak(text)) {
      tier1_failed    = true;
      tier1_error     = 'low_confidence_output';
      fallback_reason = 'low_confidence';
    }
  } catch (err) {
    tier1_failed    = true;
    tier1_error     = (err as Error).message;
    fallback_reason = 'error';
  }

  // Tier 2 fallback
  if (tier1_failed && env.GEMINI_API_KEY) {
    try {
      const r = await runGemini(env, prompt);
      text       = r.text;
      latency_ms = r.ms;
      tier_used  = 'gemini';
      model_id   = GEMINI_MODEL;
    } catch (err) {
      // Ambos falharam
      throw new Error(`both_tiers_failed: tier1=${tier1_error}; tier2=${(err as Error).message}`);
    }
  } else if (tier1_failed && !env.GEMINI_API_KEY) {
    throw new Error(`tier1_failed_no_tier2: ${tier1_error}`);
  }

  // Cache
  await env.CACHE.put(cacheKey, JSON.stringify({ text, tier_used, model_id }), { expirationTtl: CACHE_TTL_S });

  // Audit
  const audit_id = randomId(8);
  await env.DB.prepare(`INSERT INTO ia_audit_log
    (id,professor_id,student_id,context,tier_used,model_id,prompt_hash,latency_ms,tier1_failed,tier1_error,fallback_reason,pt_reviewed)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,0)`).bind(
    audit_id, opts.professor_id, opts.student_id || null, context,
    tier_used, model_id, prompt_hash, latency_ms,
    tier1_failed ? 1 : 0, tier1_error || null, fallback_reason
  ).run();

  return { text, tier_used, model_id, prompt_hash, cached: false, latency_ms, tier1_failed, tier1_error, audit_id };
}
