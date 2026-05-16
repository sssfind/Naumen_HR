CREATE TABLE trainee_plan_tasks (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    block VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    deadline DATE NOT NULL,
    priority VARCHAR(32) NOT NULL,
    acceptance_criteria TEXT NOT NULL,
    acceptance_check_type VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trainee_plan_tasks_block CHECK (block IN ('ONBOARDING', 'SKILLS', 'WORK')),
    CONSTRAINT chk_trainee_plan_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_trainee_plan_tasks_acceptance_check CHECK (acceptance_check_type IN ('MACHINE', 'USER'))
);

CREATE INDEX idx_trainee_plan_tasks_trainee_block
    ON trainee_plan_tasks(trainee_id, block);
