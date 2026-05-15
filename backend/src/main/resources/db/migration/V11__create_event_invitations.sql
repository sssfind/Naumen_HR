CREATE TABLE IF NOT EXISTS event_invitations (
    id                  BIGSERIAL PRIMARY KEY,
    event_id            BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    invited_user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by_user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invited_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_invitations_event_user UNIQUE (event_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id
    ON event_invitations (event_id);

CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_user_id
    ON event_invitations (invited_user_id);

CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_by_user_id
    ON event_invitations (invited_by_user_id);
