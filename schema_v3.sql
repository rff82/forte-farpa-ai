-- forte-farpa-ai · schema_v3.sql · 2026-04-19
-- Delta v2 → v3: colunas extras Onda B Turno 2

-- E5: porcentagem de edição humana sobre prescrição IA
ALTER TABLE workout_plans ADD COLUMN ia_editada_pct REAL DEFAULT 0;

-- E3: modo de onboarding do aluno (quick | clinical | simple)
ALTER TABLE student_profiles ADD COLUMN onboarding_mode TEXT DEFAULT 'quick';

-- E7: opt-in comunidade
ALTER TABLE users ADD COLUMN community_opt_in INTEGER DEFAULT 0;

-- E10: preferência de idioma (pt-BR | en)
ALTER TABLE users ADD COLUMN locale TEXT DEFAULT 'pt-BR';

-- E13: opt-in notificações e-mail
ALTER TABLE users ADD COLUMN email_notifications_opt_in INTEGER DEFAULT 0;
