ALTER TABLE users
    ADD COLUMN adaptation_start_date DATE;

ALTER TABLE trainee_plan_tasks
    ADD COLUMN is_milestone BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE adaptation_plan_template_tasks
    ADD COLUMN is_milestone BOOLEAN NOT NULL DEFAULT FALSE;

-- Контрольные точки в системных шаблонах: конец каждого месяца + ключевые вехи
UPDATE adaptation_plan_template_tasks
SET is_milestone = TRUE
WHERE days_from_start IN (7, 21, 42, 63, 84)
   OR description ILIKE '%презент%'
   OR description ILIKE '%итог%адаптац%';

-- Старт адаптации: по самой ранней задаче (типично первая веха на 7-й день)
UPDATE users u
SET adaptation_start_date = sub.plan_start
FROM (
    SELECT t.trainee_id,
           MIN(t.deadline) - INTERVAL '7 days' AS plan_start
    FROM trainee_plan_tasks t
    GROUP BY t.trainee_id
) sub
WHERE u.id = sub.trainee_id
  AND u.role = 'ROLE_TRAINEE';

-- Пометить контрольные точки у уже созданных задач стажёров
UPDATE trainee_plan_tasks t
SET is_milestone = TRUE
FROM adaptation_plan_template_tasks tt
WHERE tt.is_milestone = TRUE
  AND tt.description = t.description;

UPDATE trainee_plan_tasks
SET is_milestone = TRUE
WHERE is_milestone = FALSE
  AND (
      priority = 'HIGH'
      AND acceptance_check_type = 'USER'
      AND (
          description ILIKE '%презент%'
          OR description ILIKE '%итог%'
          OR description ILIKE '%1:1%'
      )
  );
