-- Повторное применение для БД, где V9 уже отметился в flyway_schema_history, но не обновил строки
-- (старый вариант с ~ '^employee[0-9]{2}@...' мог не совпасть с email в окружении).
UPDATE user_skill us
SET
    stars      = floor(random() * 16)::INT,
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = us.user_id
      AND lower(u.email) LIKE 'employee%@naumen.ru'
);
