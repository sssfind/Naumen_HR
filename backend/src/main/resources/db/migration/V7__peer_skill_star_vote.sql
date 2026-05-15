-- Голос «звезда» от коллеги за навык пользователя (один голос от одного человека на запись user_skill).
CREATE TABLE IF NOT EXISTS peer_skill_star_vote (
    id              BIGSERIAL PRIMARY KEY,
    voter_user_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_skill_id   BIGINT NOT NULL REFERENCES user_skill (id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_peer_skill_star_vote UNIQUE (voter_user_id, user_skill_id)
);

CREATE INDEX IF NOT EXISTS idx_peer_star_vote_user_skill ON peer_skill_star_vote (user_skill_id);
