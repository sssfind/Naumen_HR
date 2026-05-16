
-- Создание таблицы пользователей
CREATE TABLE users (
                       id              BIGSERIAL PRIMARY KEY,
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       password_hash   VARCHAR(255) NOT NULL,
                       full_name       VARCHAR(255) NOT NULL,
                       department      VARCHAR(255),
                       role            VARCHAR(50)  NOT NULL DEFAULT 'ROLE_EMPLOYEE',
                       is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
                       created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);