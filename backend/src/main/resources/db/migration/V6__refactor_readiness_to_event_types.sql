-- 1. Удалить старый столбец readiness_status из таблицы users
ALTER TABLE users DROP COLUMN IF EXISTS readiness_status;

-- 2. Удалить столбец readiness_status из таблицы user_skill
ALTER TABLE user_skill DROP COLUMN IF EXISTS readiness_status;

-- 3. Удалить старый ENUM (если не используется нигде ещё)
DROP TYPE IF EXISTS readiness_status;

-- 4. Создать новый ENUM для типов мероприятий, к которым готов сотрудник
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'readiness_event_type') THEN
        CREATE TYPE readiness_event_type AS ENUM (
            'MENTORSHIP',
            'PUBLIC_SPEAKING',
            'JURY_WORK',
            'WORKSHOP_FACILITATION',
            'LECTURE_DELIVERY',
            'HACKATHON_PARTICIPATION',
            'EVENT_ORGANIZATION'
        );
    END IF;
END $$;

-- 5. Создать таблицу user_readiness (многие-ко-многим: пользователь → типы мероприятий)
CREATE TABLE IF NOT EXISTS user_readiness (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    readiness_event_type readiness_event_type NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_readiness UNIQUE (user_id, readiness_event_type)
);

CREATE INDEX IF NOT EXISTS idx_user_readiness_user_id ON user_readiness (user_id);
CREATE INDEX IF NOT EXISTS idx_user_readiness_event_type ON user_readiness (readiness_event_type);

-- 6. Seed: заполнить готовность для тестовых сотрудников
WITH employees AS (
    SELECT
        id,
        ((regexp_match(email, '^employee([0-9]{2})@naumen\.ru$'))[1])::INT AS employee_no
    FROM users
    WHERE email ~ '^employee[0-9]{2}@naumen\.ru$'
),
readiness_rows AS (
    SELECT
        e.id AS user_id,
        r.readiness_event_type
    FROM employees e
    CROSS JOIN LATERAL (
        VALUES
            (CASE WHEN e.employee_no % 2 = 0 THEN 'PUBLIC_SPEAKING'::readiness_event_type ELSE 'MENTORSHIP'::readiness_event_type END),
            (CASE WHEN e.employee_no % 3 = 0 THEN 'JURY_WORK'::readiness_event_type ELSE 'WORKSHOP_FACILITATION'::readiness_event_type END),
            (CASE WHEN e.employee_no % 5 = 0 THEN 'LECTURE_DELIVERY'::readiness_event_type ELSE 'HACKATHON_PARTICIPATION'::readiness_event_type END)
    ) AS r(readiness_event_type)
)
INSERT INTO user_readiness (user_id, readiness_event_type, created_at)
SELECT user_id, readiness_event_type, NOW() - ((user_id % 10) || ' days')::INTERVAL
FROM readiness_rows
ON CONFLICT (user_id, readiness_event_type) DO NOTHING;
