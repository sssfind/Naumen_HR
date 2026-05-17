ALTER TABLE users
    ADD COLUMN mentor_id BIGINT REFERENCES users (id);

CREATE INDEX idx_users_mentor_id ON users (mentor_id);

-- Ранее наставник записывался в hr_id — переносим в mentor_id
UPDATE users u
SET mentor_id = u.hr_id
FROM users ref
WHERE u.hr_id = ref.id
  AND ref.role = 'ROLE_MENTOR'
  AND u.role = 'ROLE_TRAINEE';

UPDATE users u
SET hr_id = NULL
WHERE u.role = 'ROLE_TRAINEE'
  AND u.mentor_id IS NOT NULL
  AND u.hr_id = u.mentor_id;
