-- Расширение схемы для карты экспертизы:
-- 1) Профессиональные и экспертные навыки
-- 2) Уровень владения навыками
-- 3) Опыт участия в мероприятиях
-- 4) Статус готовности

-- =========================
-- ENUM-типы
-- =========================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_category') THEN
        CREATE TYPE skill_category AS ENUM ('PROFESSIONAL', 'EXPERT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proficiency_level') THEN
        CREATE TYPE proficiency_level AS ENUM ('BASIC', 'CONFIDENT', 'EXPERT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'readiness_status') THEN
        CREATE TYPE readiness_status AS ENUM ('NOT_READY', 'OPEN', 'READY');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participation_role') THEN
        CREATE TYPE participation_role AS ENUM ('SPEAKER', 'MENTOR', 'JURY', 'PARTICIPANT', 'ORGANIZER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_level') THEN
        CREATE TYPE result_level AS ENUM ('NONE', 'SHORTLIST', 'WINNER');
    END IF;
END $$;

-- =========================
-- Общий статус готовности пользователя
-- =========================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS readiness_status readiness_status NOT NULL DEFAULT 'OPEN';

-- =========================
-- Справочник навыков
-- =========================
CREATE TABLE IF NOT EXISTS skills (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    category    skill_category NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);

-- =========================
-- Навыки пользователя + уровень владения
-- =========================
CREATE TABLE IF NOT EXISTS user_skill (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id           BIGINT NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    proficiency_level  proficiency_level NOT NULL,
    readiness_status   readiness_status NOT NULL DEFAULT 'OPEN',
    stars              INT NOT NULL DEFAULT 0 CHECK (stars >= 0),
    notes              TEXT,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skill_user_id ON user_skill (user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_skill_id ON user_skill (skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_level ON user_skill (proficiency_level);

-- =========================
-- Мероприятия
-- =========================
CREATE TABLE IF NOT EXISTS events (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    event_type   VARCHAR(100) NOT NULL,
    event_date   DATE NOT NULL,
    organizer    VARCHAR(255),
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (event_type);

-- =========================
-- Опыт пользователя в мероприятиях
-- =========================
CREATE TABLE IF NOT EXISTS user_event_experience (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id            BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participation_role  participation_role NOT NULL,
    result_level        result_level NOT NULL DEFAULT 'NONE',
    feedback            TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_event_role UNIQUE (user_id, event_id, participation_role)
);

CREATE INDEX IF NOT EXISTS idx_user_event_user_id ON user_event_experience (user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_event_id ON user_event_experience (event_id);
