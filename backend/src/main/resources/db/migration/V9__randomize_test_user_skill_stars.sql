-- Случайное число звёзд от 0 до 15 на каждой записи навыка у тестовых сотрудников (employeeXX@naumen.ru).
UPDATE user_skill us
SET
    stars      = floor(random() * 16)::INT,
    updated_at = NOW()
FROM users u
WHERE us.user_id = u.id
  AND u.email ~ '^employee[0-9]{2}@naumen\.ru$';
