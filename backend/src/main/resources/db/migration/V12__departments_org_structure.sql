-- Организационная структура: отделы и команды

CREATE TABLE departments (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    parent_id    BIGINT REFERENCES departments (id) ON DELETE SET NULL,
    description  VARCHAR(500),
    sort_order   INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_departments_name_parent UNIQUE (name, parent_id)
);

CREATE INDEX idx_departments_parent_id ON departments (parent_id);

ALTER TABLE users
    ADD COLUMN department_id       BIGINT REFERENCES departments (id) ON DELETE SET NULL,
    ADD COLUMN responsibility_zone VARCHAR(500);

CREATE INDEX idx_users_department_id ON users (department_id);

-- Корневые направления
INSERT INTO departments (name, parent_id, description, sort_order) VALUES
    ('IT и разработка', NULL, 'Инженерные команды: разработка, тестирование, DevOps, ИБ', 10),
    ('Продукт и аналитика', NULL, 'Продуктовые роли, аналитика, дизайн, data science', 20),
    ('Корпоративные функции', NULL, 'HR, поддержка, администрирование', 30);

-- Подотделы IT
INSERT INTO departments (name, parent_id, description, sort_order)
SELECT v.name, p.id, v.description, v.sort_order
FROM departments p,
     (VALUES
         ('Backend', 'Разработка серверной части и API', 11),
         ('Frontend', 'Клиентские приложения и UI', 12),
         ('DevOps', 'Инфраструктура, CI/CD, эксплуатация', 13),
         ('Тестирование', 'QA, автотесты, качество релизов', 14),
         ('Информационная безопасность', 'ИБ, аудит, политики доступа', 15)
     ) AS v(name, description, sort_order)
WHERE p.name = 'IT и разработка';

-- Подотделы продукта
INSERT INTO departments (name, parent_id, description, sort_order)
SELECT v.name, p.id, v.description, v.sort_order
FROM departments p,
     (VALUES
         ('Управление проектами', 'Планирование, delivery, координация команд', 21),
         ('Маркетинг', 'Продуктовый маркетинг и коммуникации', 22),
         ('Аналитика', 'Системная и бизнес-аналитика', 23),
         ('Data Science', 'ML, аналитика данных, исследования', 24),
         ('Дизайн (UX/UI)', 'Пользовательский опыт и интерфейсы', 25)
     ) AS v(name, description, sort_order)
WHERE p.name = 'Продукт и аналитика';

-- Подотделы корпоративных функций
INSERT INTO departments (name, parent_id, description, sort_order)
SELECT v.name, p.id, v.description, v.sort_order
FROM departments p,
     (VALUES
         ('HR', 'Подбор, адаптация, кадровое сопровождение', 31),
         ('Служба поддержки', 'Helpdesk, доступы, рабочие места', 32)
     ) AS v(name, description, sort_order)
WHERE p.name = 'Корпоративные функции';

-- Привязка существующих пользователей к отделам по текстовому полю department
UPDATE users u
SET department_id = d.id
FROM departments d
WHERE u.department IS NOT NULL
  AND u.department = d.name
  AND d.parent_id IS NOT NULL;

UPDATE users u
SET department_id = d.id
FROM departments d
WHERE u.department = 'HR'
  AND d.name = 'HR';

-- Зона ответственности по умолчанию для уже существующих записей
UPDATE users
SET responsibility_zone = COALESCE(
        NULLIF(TRIM(position), ''),
        'Сотрудник направления «' || COALESCE(department, 'компания') || '»'
    )
WHERE responsibility_zone IS NULL;
