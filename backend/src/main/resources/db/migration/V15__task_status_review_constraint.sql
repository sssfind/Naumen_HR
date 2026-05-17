ALTER TABLE trainee_plan_tasks
    DROP CONSTRAINT IF EXISTS chk_trainee_plan_tasks_status;

ALTER TABLE trainee_plan_tasks
    ADD CONSTRAINT chk_trainee_plan_tasks_status
        CHECK (status IN (
            'NOT_STARTED',
            'IN_PROGRESS',
            'PENDING_REVIEW',
            'REJECTED',
            'COMPLETED'
        ));
