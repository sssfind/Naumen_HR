DELETE FROM feedback_responses;

ALTER TABLE feedback_responses
    DROP COLUMN IF EXISTS mood_level,
    DROP COLUMN IF EXISTS has_resources_access;

ALTER TABLE feedback_responses
    RENAME COLUMN comment TO week_comment;

ALTER TABLE feedback_responses
    ADD COLUMN week_rating VARCHAR(32) NOT NULL DEFAULT 'GOOD',
    ADD COLUMN resource_issues TEXT NOT NULL DEFAULT 'ALL_OK',
    ADD COLUMN mentor_rating INTEGER NOT NULL DEFAULT 3;

ALTER TABLE feedback_responses
    ALTER COLUMN week_rating DROP DEFAULT,
    ALTER COLUMN resource_issues DROP DEFAULT,
    ALTER COLUMN mentor_rating DROP DEFAULT;

ALTER TABLE feedback_responses
    ADD CONSTRAINT chk_feedback_week_rating CHECK (
        week_rating IN ('EXCELLENT', 'GOOD', 'OKAY_DIFFICULT', 'STRESSED', 'NEED_HELP')
    );

ALTER TABLE feedback_responses
    ADD CONSTRAINT chk_feedback_mentor_rating CHECK (mentor_rating BETWEEN 1 AND 5);
