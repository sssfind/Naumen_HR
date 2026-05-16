ALTER TABLE trainee_plan_tasks
    ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    ADD COLUMN started_at TIMESTAMPTZ,
    ADD COLUMN completed_at TIMESTAMPTZ;

ALTER TABLE trainee_plan_tasks
    ADD CONSTRAINT chk_trainee_plan_tasks_status
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'));

CREATE TABLE trainee_plan_task_comments (
    id         BIGSERIAL PRIMARY KEY,
    task_id    BIGINT       NOT NULL REFERENCES trainee_plan_tasks (id) ON DELETE CASCADE,
    author_id  BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    text       TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainee_plan_task_comments_task_id
    ON trainee_plan_task_comments (task_id);
