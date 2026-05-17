ALTER TABLE feedback_responses
    ADD COLUMN sentiment_score INTEGER,
    ADD COLUMN sentiment_label VARCHAR(32),
    ADD COLUMN comment_sentiment VARCHAR(32),
    ADD COLUMN comment_risk_flags VARCHAR(256),
    ADD COLUMN comment_summary TEXT,
    ADD COLUMN comment_analyzed_at TIMESTAMPTZ;

ALTER TABLE feedback_responses
    ADD CONSTRAINT chk_feedback_sentiment_score
        CHECK (sentiment_score IS NULL OR (sentiment_score >= 0 AND sentiment_score <= 100));
