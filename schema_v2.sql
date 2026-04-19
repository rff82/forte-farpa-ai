-- forte-farpa-ai · schema_v2.sql · 2026-04-19
-- Migration cumulativa sobre schema.sql v1.0 cobrindo refinamentos do Founder
-- (Onda A / F7) — épicos E3/E4/E5/E6/E7/E8/E13 + ADR 016 Pix manual.
--
-- Ordem de aplicação:
--   1) npx wrangler d1 execute forte-farpa-ai-db --file ./schema.sql   --remote
--   2) npx wrangler d1 execute forte-farpa-ai-db --file ./schema_v2.sql --remote
--
-- Idempotente: todas as criações usam IF NOT EXISTS; ALTERs usam padrão
-- "try/ignore" — rodar uma vez por DB. Se coluna já existe, comente a linha.

-- =============================================================================
-- E3 · AGENDA — slots PT + estados ampliados + aprovação fora-de-slot
-- =============================================================================

-- Slots disponibilizados pelo PT (janelas recorrentes ou pontuais)
CREATE TABLE IF NOT EXISTS session_slots (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at      INTEGER NOT NULL,      -- unix timestamp (UTC)
  ends_at        INTEGER NOT NULL,
  recurrence     TEXT DEFAULT 'once' CHECK(recurrence IN ('once','weekly')),
  weekday        INTEGER,               -- 0..6 quando recurrence='weekly'
  capacity       INTEGER DEFAULT 1,     -- >1 = aulas em grupo (futuro)
  status         TEXT DEFAULT 'open' CHECK(status IN ('open','blocked','full','cancelled')),
  notes          TEXT,
  created_at     INTEGER DEFAULT (unixepoch()),
  updated_at     INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_slots_professor ON session_slots(professor_id);
CREATE INDEX IF NOT EXISTS idx_slots_window    ON session_slots(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_slots_status    ON session_slots(status);

-- Amplia estados de sessions (proposed_by_student, slot_available, confirmed,
-- done, no_show, cancelled) preservando v1 ('agendada','confirmada','realizada',
-- 'cancelada','falta') via CHECK substitutivo. D1/SQLite não faz DROP CHECK —
-- estratégia: tabela sessions_v2 + backfill. Fazemos shadow em nova tabela e
-- deixamos a v1 congelada enquanto worker faz dual-write, até cut-over.
CREATE TABLE IF NOT EXISTS sessions_v2 (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id   TEXT NOT NULL REFERENCES users(id),
  student_id     TEXT NOT NULL REFERENCES student_profiles(id),
  plan_id        TEXT REFERENCES workout_plans(id),
  slot_id        TEXT REFERENCES session_slots(id),
  scheduled_at   INTEGER NOT NULL,
  duration_min   INTEGER DEFAULT 60,
  status         TEXT NOT NULL DEFAULT 'slot_available' CHECK(status IN (
                   'proposed_by_student',   -- aluno pediu horário fora do slot
                   'slot_available',        -- slot aberto do PT
                   'confirmed',             -- PT confirmou (ou aprovou proposta)
                   'done',                  -- realizada
                   'no_show',               -- aluno não compareceu
                   'cancelled'              -- cancelada por qualquer parte
                 )),
  proposed_by    TEXT CHECK(proposed_by IN ('professor','aluno')),
  cancelled_by   TEXT CHECK(cancelled_by IN ('professor','aluno','system')),
  cancel_reason  TEXT,
  notes          TEXT,
  created_at     INTEGER DEFAULT (unixepoch()),
  updated_at     INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sessions_v2_prof   ON sessions_v2(professor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_v2_stud   ON sessions_v2(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_v2_sched  ON sessions_v2(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_v2_status ON sessions_v2(status);
CREATE INDEX IF NOT EXISTS idx_sessions_v2_slot   ON sessions_v2(slot_id);

-- =============================================================================
-- E4 · ANAMNESE — versionamento (histórico imutável)
-- =============================================================================
CREATE TABLE IF NOT EXISTS anamnesis_versions (
  id                        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  anamnesis_id              TEXT NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,
  student_id                TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  version_number            INTEGER NOT NULL,
  snapshot_json             TEXT NOT NULL,          -- snapshot completo do registro
  changed_by_user_id        TEXT NOT NULL REFERENCES users(id),
  change_reason             TEXT,
  created_at                INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_anamnesis_ver_anam    ON anamnesis_versions(anamnesis_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_ver_student ON anamnesis_versions(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_anamnesis_ver_number
  ON anamnesis_versions(anamnesis_id, version_number);

-- =============================================================================
-- E5 · IA prescritiva dual-tier (Workers AI → Gemini fallback/refino)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ia_audit_log (
  id                 TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id       TEXT NOT NULL REFERENCES users(id),
  student_id         TEXT REFERENCES student_profiles(id),
  context            TEXT NOT NULL CHECK(context IN (
                       'workout_plan','anamnesis_summary','session_notes','other'
                     )),
  tier_used          TEXT NOT NULL CHECK(tier_used IN ('workers_ai','gemini')),
  model_id           TEXT NOT NULL,           -- ex: '@cf/meta/llama-3.1-8b' ou 'gemini-2.0-flash'
  prompt_hash        TEXT NOT NULL,           -- sha256 do prompt (coíbe duplicidade — regra Free Tier)
  prompt_tokens      INTEGER,
  completion_tokens  INTEGER,
  latency_ms         INTEGER,
  tier1_failed       INTEGER DEFAULT 0,       -- 1 se Workers AI falhou e subiu p/ Gemini
  tier1_error        TEXT,
  fallback_reason    TEXT,                    -- 'error','low_confidence','pt_refine_request'
  pt_reviewed        INTEGER DEFAULT 0,       -- 1 quando PT aprovou/editou antes de publicar
  pt_edited          INTEGER DEFAULT 0,
  published_at       INTEGER,                 -- momento em que virou conteúdo real ao aluno
  output_ref_table   TEXT,                    -- ex: 'workout_plans'
  output_ref_id      TEXT,
  cost_estimate_usd  REAL DEFAULT 0,
  created_at         INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ia_prof     ON ia_audit_log(professor_id);
CREATE INDEX IF NOT EXISTS idx_ia_tier     ON ia_audit_log(tier_used);
CREATE INDEX IF NOT EXISTS idx_ia_prompt   ON ia_audit_log(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ia_context  ON ia_audit_log(context);
CREATE INDEX IF NOT EXISTS idx_ia_created  ON ia_audit_log(created_at DESC);

-- =============================================================================
-- E6 · COBRANÇA — billing_type por aluno + Pix manual (ADR 016)
-- =============================================================================
-- Configuração de cobrança por aluno: mensalidade OU pacote de aulas.
-- PT pode manter ambos modelos em carteira simultaneamente.
CREATE TABLE IF NOT EXISTS billing_configs (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id            TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  billing_type          TEXT NOT NULL CHECK(billing_type IN ('monthly','package')),
  -- mensalidade
  monthly_amount        REAL,
  monthly_due_day       INTEGER,              -- 1..28
  -- pacote
  package_session_count INTEGER,              -- total de aulas no pacote
  package_amount        REAL,                 -- preço total do pacote
  package_validity_days INTEGER,              -- janela de validade (ex: 60)
  sessions_remaining    INTEGER,              -- saldo vivo do pacote atual
  package_started_at    INTEGER,
  package_expires_at    INTEGER,
  -- comum
  pix_key               TEXT,                 -- chave do PT para o aluno transferir
  pix_key_type          TEXT CHECK(pix_key_type IN ('cpf','cnpj','email','phone','random')),
  status                TEXT DEFAULT 'active' CHECK(status IN ('active','paused','archived')),
  created_at            INTEGER DEFAULT (unixepoch()),
  updated_at            INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_billing_prof    ON billing_configs(professor_id);
CREATE INDEX IF NOT EXISTS idx_billing_student ON billing_configs(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_billing_active_student
  ON billing_configs(student_id) WHERE status='active';

-- Confirmação manual de Pix (aluno declara pagamento, PT confirma) — ADR 016
CREATE TABLE IF NOT EXISTS pix_confirmations (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  payment_id            TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  professor_id          TEXT NOT NULL REFERENCES users(id),
  student_id            TEXT NOT NULL REFERENCES student_profiles(id),
  amount_declared       REAL NOT NULL,
  declared_at           INTEGER DEFAULT (unixepoch()),
  student_note          TEXT,
  receipt_r2_key        TEXT,                 -- comprovante opcional em R2
  status                TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
                          'pending','confirmed_by_pt','rejected_by_pt','expired'
                        )),
  pt_decision_at        INTEGER,
  pt_decision_reason    TEXT,
  created_at            INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_pixconf_payment ON pix_confirmations(payment_id);
CREATE INDEX IF NOT EXISTS idx_pixconf_prof    ON pix_confirmations(professor_id);
CREATE INDEX IF NOT EXISTS idx_pixconf_status  ON pix_confirmations(status);

-- =============================================================================
-- E7 · COMUNIDADE — posts + membros
-- =============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id      TEXT NOT NULL REFERENCES users(id),
  title          TEXT,
  body           TEXT NOT NULL,
  media_r2_keys  TEXT,                        -- JSON array
  pinned         INTEGER DEFAULT 0,
  visibility     TEXT DEFAULT 'members' CHECK(visibility IN ('members','professor_only','public')),
  status         TEXT DEFAULT 'published' CHECK(status IN ('draft','published','archived','removed')),
  created_at     INTEGER DEFAULT (unixepoch()),
  updated_at     INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cposts_prof    ON community_posts(professor_id);
CREATE INDEX IF NOT EXISTS idx_cposts_created ON community_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS community_members (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK(role IN ('owner','moderator','member','muted','banned')),
  joined_at      INTEGER DEFAULT (unixepoch()),
  last_seen_at   INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cmembers_prof_user
  ON community_members(professor_id, user_id);
CREATE INDEX IF NOT EXISTS idx_cmembers_user ON community_members(user_id);

-- =============================================================================
-- E8 · LGPD export assíncrono
-- =============================================================================
CREATE TABLE IF NOT EXISTS export_jobs (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  requested_by      TEXT NOT NULL REFERENCES users(id),
  subject_user_id   TEXT NOT NULL REFERENCES users(id),
  kind              TEXT NOT NULL CHECK(kind IN ('export','delete')),
  scope             TEXT NOT NULL DEFAULT 'all',   -- 'all' | JSON {tables:[...]}
  status            TEXT NOT NULL DEFAULT 'queued' CHECK(status IN (
                      'queued','processing','ready','failed','delivered','expired'
                    )),
  r2_key            TEXT,                          -- zip final
  download_token    TEXT,                          -- token one-shot
  download_expires  INTEGER,
  error_message     TEXT,
  requested_at      INTEGER DEFAULT (unixepoch()),
  started_at        INTEGER,
  finished_at       INTEGER,
  delivered_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_export_subject ON export_jobs(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_export_status  ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_req     ON export_jobs(requested_by);

-- =============================================================================
-- E13 · NOTIFICAÇÕES configuráveis (Email Workers + SMS provider)
-- =============================================================================

-- Config por PT: quais canais, quais janelas de antecedência, templates
CREATE TABLE IF NOT EXISTS notification_configs (
  id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled         INTEGER NOT NULL DEFAULT 1,   -- MVP: email obrigatório
  sms_enabled           INTEGER NOT NULL DEFAULT 0,
  -- janelas de lembrete em horas antes da aula (JSON array)
  -- default MVP: [32, 24, 16, 8, 2] — cada PT pode customizar
  reminder_offsets_h    TEXT NOT NULL DEFAULT '[32,24,16,8,2]',
  -- templates (placeholders: {{student_name}}, {{pt_name}}, {{when}}, {{duration}}, {{link}})
  tpl_pt_email_subject  TEXT,
  tpl_pt_email_body     TEXT,
  tpl_pt_sms            TEXT,
  tpl_student_email_subject TEXT,
  tpl_student_email_body    TEXT,
  tpl_student_sms       TEXT,
  quiet_hours_start     INTEGER,             -- 0..23 (horário local PT)
  quiet_hours_end       INTEGER,
  timezone              TEXT DEFAULT 'America/Sao_Paulo',
  created_at            INTEGER DEFAULT (unixepoch()),
  updated_at            INTEGER DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_notifcfg_prof ON notification_configs(professor_id);

-- Agendamento de lembretes por aula (gerado quando sessions_v2.status='confirmed')
CREATE TABLE IF NOT EXISTS notification_schedules (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  session_id      TEXT NOT NULL REFERENCES sessions_v2(id) ON DELETE CASCADE,
  recipient_user  TEXT NOT NULL REFERENCES users(id),
  recipient_role  TEXT NOT NULL CHECK(recipient_role IN ('professor','aluno')),
  channel         TEXT NOT NULL CHECK(channel IN ('email','sms')),
  send_at         INTEGER NOT NULL,            -- unix ts, alvo do cron
  offset_hours    INTEGER NOT NULL,            -- ex: 24
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN (
                    'scheduled','sent','failed','cancelled','skipped_quiet_hours'
                  )),
  attempt_count   INTEGER DEFAULT 0,
  last_error      TEXT,
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_notifsched_session ON notification_schedules(session_id);
CREATE INDEX IF NOT EXISTS idx_notifsched_due     ON notification_schedules(send_at, status);
CREATE INDEX IF NOT EXISTS idx_notifsched_recip   ON notification_schedules(recipient_user);

-- Log de entregas efetivas (auditoria + debug)
CREATE TABLE IF NOT EXISTS notification_logs (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  schedule_id     TEXT REFERENCES notification_schedules(id) ON DELETE SET NULL,
  session_id      TEXT REFERENCES sessions_v2(id) ON DELETE SET NULL,
  recipient_user  TEXT NOT NULL REFERENCES users(id),
  channel         TEXT NOT NULL CHECK(channel IN ('email','sms')),
  provider        TEXT,                         -- 'cf_email_workers' | 'twilio' | etc
  provider_msg_id TEXT,
  to_address      TEXT NOT NULL,                -- email ou E.164
  subject         TEXT,
  body_preview    TEXT,                         -- primeiros 200 chars (auditoria)
  status          TEXT NOT NULL CHECK(status IN ('sent','delivered','bounced','failed')),
  error_message   TEXT,
  sent_at         INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_notiflog_user    ON notification_logs(recipient_user);
CREATE INDEX IF NOT EXISTS idx_notiflog_session ON notification_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_notiflog_sent    ON notification_logs(sent_at DESC);

-- =============================================================================
-- P6 · LGPD DELETE granular — opção (c) + guardrail retenção histórico PT
-- Founder 2026-04-19 (rodada 2): aluno escolhe scope; plataforma retém campos
-- mínimos para o PT (nome, datas de aulas, registros financeiros anonimizados).
-- Disclosure obrigatório ao aluno no fluxo de exclusão e ao PT no dashboard.
-- =============================================================================
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id                     TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id                TEXT NOT NULL REFERENCES users(id),   -- aluno solicitante
  professor_id           TEXT REFERENCES users(id),            -- PT impactado (para disclosure)
  scope_json             TEXT NOT NULL,                        -- o que o aluno pediu apagar
                                                               --   ex: {"anamnese":true,"medidas":true,
                                                               --        "comunidade":true,"conta":true}
  retained_fields_json   TEXT NOT NULL,                        -- o que ficou retido + razão
                                                               --   ex: {"nome":"historico_pt",
                                                               --        "sessions_dates":"historico_pt",
                                                               --        "payments_anonimizados":"fiscal_5y"}
  disclosure_shown_at    INTEGER NOT NULL,                     -- timestamp que aluno viu o aviso
  pt_disclosure_shown_at INTEGER,                              -- quando PT foi notificado no dashboard
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
                           'pending','processing','completed','failed'
                         )),
  export_job_id          TEXT REFERENCES export_jobs(id),      -- liga ao export async (E8)
  error_message          TEXT,
  created_at             INTEGER DEFAULT (unixepoch()),
  completed_at           INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ddr_user   ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ddr_pt     ON data_deletion_requests(professor_id);
CREATE INDEX IF NOT EXISTS idx_ddr_status ON data_deletion_requests(status);

-- =============================================================================
-- FIM · schema_v2.sql — 12 tabelas novas + sessions_v2 shadow
-- =============================================================================
