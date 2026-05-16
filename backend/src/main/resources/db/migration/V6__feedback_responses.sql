CREATE TABLE feedback_responses (
    id                   BIGSERIAL PRIMARY KEY,
    trainee_id           BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    week_start           DATE         NOT NULL,
    mood_level           INTEGER      NOT NULL,
    tasks_clarity        INTEGER      NOT NULL,
    has_resources_access BOOLEAN      NOT NULL,
    comment              TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_feedback_trainee_week UNIQUE (trainee_id, week_start),
    CONSTRAINT chk_feedback_mood CHECK (mood_level BETWEEN 1 AND 5),
    CONSTRAINT chk_feedback_clarity CHECK (tasks_clarity BETWEEN 1 AND 5)
);

CREATE INDEX idx_feedback_trainee_week ON feedback_responses (trainee_id, week_start DESC);
