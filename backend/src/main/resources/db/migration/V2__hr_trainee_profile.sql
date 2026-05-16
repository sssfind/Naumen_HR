ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE users ADD COLUMN position VARCHAR(255);
ALTER TABLE users ADD COLUMN hr_id BIGINT REFERENCES users (id);

CREATE INDEX idx_users_hr_id ON users (hr_id);
