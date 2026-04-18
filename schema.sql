-- forte-farpa-ai · schema.sql · v1.0 · 2026-04-17
-- Personal Trainer Management Platform

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK(role IN ('professor', 'aluno')),
  phone         TEXT,
  avatar_url    TEXT,
  password_hash TEXT,
  created_at    INTEGER DEFAULT (unixepoch()),
  updated_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS professor_profiles (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio             TEXT,
  specialty       TEXT,
  cref            TEXT,
  session_price   REAL DEFAULT 0,
  monthly_price   REAL DEFAULT 0,
  created_at      INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professor_id        TEXT NOT NULL REFERENCES users(id),
  objective           TEXT,
  plan_type           TEXT DEFAULT 'mensal' CHECK(plan_type IN ('por_sessao','semanal','mensal','trimestral')),
  sessions_per_week   INTEGER DEFAULT 3,
  plan_value          REAL DEFAULT 0,
  status              TEXT DEFAULT 'ativo' CHECK(status IN ('ativo','inativo','pausado')),
  start_date          INTEGER DEFAULT (unixepoch()),
  created_at          INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS anamneses (
  id                          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  student_id                  TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  has_heart_issue             INTEGER DEFAULT 0,
  has_hypertension            INTEGER DEFAULT 0,
  has_diabetes                INTEGER DEFAULT 0,
  has_joint_pain              INTEGER DEFAULT 0,
  medications                 TEXT,
  injuries                    TEXT,
  physical_activity_history   TEXT,
  goals                       TEXT,
  observations                TEXT,
  created_at                  INTEGER DEFAULT (unixepoch()),
  updated_at                  INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  student_id      TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  weight_kg       REAL,
  height_cm       REAL,
  body_fat_pct    REAL,
  chest_cm        REAL,
  waist_cm        REAL,
  hip_cm          REAL,
  bicep_cm        REAL,
  thigh_cm        REAL,
  calf_cm         REAL,
  notes           TEXT,
  measured_at     INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  student_id      TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  professor_id    TEXT NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  goal            TEXT,
  frequency       INTEGER DEFAULT 3,
  status          TEXT DEFAULT 'ativo' CHECK(status IN ('ativo','inativo','arquivado')),
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  plan_id         TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_label       TEXT NOT NULL,
  exercise_name   TEXT NOT NULL,
  sets            INTEGER,
  reps            TEXT,
  rest_seconds    INTEGER,
  notes           TEXT,
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id    TEXT NOT NULL REFERENCES users(id),
  student_id      TEXT NOT NULL REFERENCES student_profiles(id),
  plan_id         TEXT REFERENCES workout_plans(id),
  scheduled_at    INTEGER NOT NULL,
  duration_min    INTEGER DEFAULT 60,
  status          TEXT DEFAULT 'agendada' CHECK(status IN ('agendada','confirmada','realizada','cancelada','falta')),
  notes           TEXT,
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  professor_id    TEXT NOT NULL REFERENCES users(id),
  student_id      TEXT NOT NULL REFERENCES student_profiles(id),
  amount          REAL NOT NULL,
  due_date        INTEGER NOT NULL,
  paid_at         INTEGER,
  method          TEXT CHECK(method IN ('pix','dinheiro','cartao','transferencia')),
  reference_month TEXT,
  status          TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','pago','atrasado','cancelado')),
  notes           TEXT,
  created_at      INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_student_professor    ON student_profiles(professor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_professor   ON sessions(professor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student     ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled   ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status      ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_payments_professor   ON payments(professor_id);
CREATE INDEX IF NOT EXISTS idx_payments_student     ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_due         ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);
CREATE INDEX IF NOT EXISTS idx_measurements_student ON body_measurements(student_id);
CREATE INDEX IF NOT EXISTS idx_measurements_date    ON body_measurements(measured_at DESC);
