ALTER TABLE notifications ADD COLUMN dedup_key VARCHAR(128);

CREATE UNIQUE INDEX idx_notifications_user_dedup
    ON notifications (user_id, dedup_key)
    WHERE dedup_key IS NOT NULL;
