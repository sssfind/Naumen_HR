CREATE TABLE adaptation_plan_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_position VARCHAR(255),
    duration_weeks INT NOT NULL DEFAULT 12,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_hr_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE adaptation_plan_template_tasks (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES adaptation_plan_templates(id) ON DELETE CASCADE,
    block VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    acceptance_criteria TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL,
    acceptance_check_type VARCHAR(32) NOT NULL,
    days_from_start INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_template_tasks_block CHECK (block IN ('ONBOARDING', 'SKILLS', 'WORK')),
    CONSTRAINT chk_template_tasks_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_template_tasks_acceptance CHECK (acceptance_check_type IN ('MACHINE', 'USER')),
    CONSTRAINT chk_template_tasks_days CHECK (days_from_start >= 0)
);

CREATE INDEX idx_template_tasks_template ON adaptation_plan_template_tasks(template_id, block, sort_order);

-- 1. Универсальная адаптация (3 месяца)
INSERT INTO adaptation_plan_templates (name, description, target_position, duration_weeks, is_system)
VALUES (
    'Универсальная адаптация',
    'Базовый план на 12 недель для любой роли: знакомство с компанией, навыки и первые рабочие задачи.',
    NULL,
    12,
    TRUE
);

INSERT INTO adaptation_plan_template_tasks (template_id, block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
SELECT t.id, v.block, v.description, v.acceptance_criteria, v.priority, v.acceptance_check_type, v.days_from_start, v.sort_order
FROM adaptation_plan_templates t,
(VALUES
    ('ONBOARDING', 'Пройти вводный курс в LMS и сдать итоговый тест', 'Тест пройден с результатом не ниже 80%', 'HIGH', 'MACHINE', 7, 1),
    ('ONBOARDING', 'Встреча 1:1 с HR-куратором: цели испытательного срока', 'Встреча проведена, цели зафиксированы в профиле', 'HIGH', 'USER', 10, 2),
    ('ONBOARDING', 'Знакомство с командой: встречи с тимлидом и buddy', 'Проведены минимум 2 встречи, есть заметки', 'MEDIUM', 'USER', 14, 3),
    ('ONBOARDING', 'Изучить регламенты отдела на корпоративном портале', 'Отмечены прочитанными ключевые документы', 'MEDIUM', 'MACHINE', 21, 4),
    ('SKILLS', 'Настроить рабочее окружение и получить необходимые доступы', 'Все доступы выданы, окружение работает', 'HIGH', 'USER', 28, 5),
    ('SKILLS', 'Изучить внутренние процессы и инструменты команды', 'Есть конспект или чек-лист по процессам', 'MEDIUM', 'USER', 35, 6),
    ('SKILLS', 'Выполнить учебное задание под наставничеством', 'Задание принято наставником или HR', 'MEDIUM', 'USER', 42, 7),
    ('WORK', 'Взять в работу первую задачу из бэклога (низкая сложность)', 'Задача переведена в статус «выполнено»', 'HIGH', 'USER', 49, 8),
    ('WORK', 'Участвовать в регулярных встречах команды', 'Не менее 5 встреч за 2 недели', 'MEDIUM', 'MACHINE', 56, 9),
    ('WORK', 'Подготовить мини-демо результата за период адаптации', 'Демо проведено для команды', 'MEDIUM', 'USER', 63, 10)
) AS v(block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
WHERE t.name = 'Универсальная адаптация';

-- 2. Java-разработчик
INSERT INTO adaptation_plan_templates (name, description, target_position, duration_weeks, is_system)
VALUES (
    'Java-разработчик',
    'План адаптации для backend-разработчиков: окружение, кодовая база, code review и первые тикеты.',
    'Java Developer',
    12,
    TRUE
);

INSERT INTO adaptation_plan_template_tasks (template_id, block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
SELECT t.id, v.block, v.description, v.acceptance_criteria, v.priority, v.acceptance_check_type, v.days_from_start, v.sort_order
FROM adaptation_plan_templates t,
(VALUES
    ('ONBOARDING', 'Пройти вводный курс в LMS и сдать итоговый тест', 'Тест пройден с результатом не ниже 80%', 'HIGH', 'MACHINE', 7, 1),
    ('ONBOARDING', 'Встреча 1:1 с HR-куратором: цели испытательного срока', 'Встреча проведена, цели зафиксированы', 'HIGH', 'USER', 10, 2),
    ('ONBOARDING', 'Знакомство с командой разработки и наставником', 'Проведены встречи с тимлидом и buddy', 'MEDIUM', 'USER', 14, 3),
    ('ONBOARDING', 'Изучить регламенты разработки и политику безопасности', 'Ключевые документы отмечены прочитанными', 'MEDIUM', 'MACHINE', 21, 4),
    ('SKILLS', 'Настроить JDK, IDE, Maven/Gradle и доступ к Git', 'Локальная сборка проходит успешно', 'HIGH', 'USER', 28, 5),
    ('SKILLS', 'Разобрать архитектуру основного сервиса по wiki', 'Есть конспект или схема компонентов', 'MEDIUM', 'USER', 35, 6),
    ('SKILLS', 'Выполнить учебную задачу по code style и пройти code review', 'PR принят без блокирующих замечаний', 'HIGH', 'USER', 42, 7),
    ('SKILLS', 'Написать unit-тесты к учебному модулю', 'Покрытие согласовано с наставником', 'MEDIUM', 'USER', 49, 8),
    ('WORK', 'Взять первый тикет из бэклога (низкая сложность)', 'Тикет переведён в Done', 'HIGH', 'USER', 56, 9),
    ('WORK', 'Участвовать в daily и фиксировать статус в трекере', 'Не менее 5 dailies за 2 недели', 'MEDIUM', 'MACHINE', 63, 10),
    ('WORK', 'Подготовить демо по результатам адаптации', 'Демо проведено для команды', 'MEDIUM', 'USER', 70, 11)
) AS v(block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
WHERE t.name = 'Java-разработчик';

-- 3. QA-инженер
INSERT INTO adaptation_plan_templates (name, description, target_position, duration_weeks, is_system)
VALUES (
    'QA-инженер',
    'План для тестировщиков: тестовая среда, регресс, автотесты и первые баг-репорты.',
    'QA Engineer',
    12,
    TRUE
);

INSERT INTO adaptation_plan_template_tasks (template_id, block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
SELECT t.id, v.block, v.description, v.acceptance_criteria, v.priority, v.acceptance_check_type, v.days_from_start, v.sort_order
FROM adaptation_plan_templates t,
(VALUES
    ('ONBOARDING', 'Пройти вводный курс в LMS', 'Тест пройден с результатом не ниже 80%', 'HIGH', 'MACHINE', 7, 1),
    ('ONBOARDING', 'Встреча с HR: цели испытательного срока', 'Цели зафиксированы в профиле', 'HIGH', 'USER', 10, 2),
    ('ONBOARDING', 'Знакомство с QA-командой и продуктом', 'Проведены встречи с тимлидом QA и аналитиком', 'MEDIUM', 'USER', 14, 3),
    ('ONBOARDING', 'Изучить стандарты тестирования и шаблоны баг-репортов', 'Документы изучены, есть вопросы наставнику', 'MEDIUM', 'MACHINE', 21, 4),
    ('SKILLS', 'Получить доступы к тестовым стендам и трекеру', 'Доступы выданы, вход выполнен', 'HIGH', 'USER', 28, 5),
    ('SKILLS', 'Пройти smoke-тест по чек-листу наставника', 'Чек-лист выполнен, отчёт отправлен', 'MEDIUM', 'USER', 35, 6),
    ('SKILLS', 'Написать первый автотест (UI или API) по шаблону', 'Тест в репозитории, проходит в CI', 'HIGH', 'USER', 42, 7),
    ('WORK', 'Завести и провести тестирование первого тикета', 'Баг-репорт или отчёт о тестировании в трекере', 'HIGH', 'USER', 49, 8),
    ('WORK', 'Участвовать в регрессии релиза', 'Выполнен согласованный объём кейсов', 'MEDIUM', 'USER', 56, 9),
    ('WORK', 'Подготовить отчёт по итогам адаптации', 'Отчёт представлен команде', 'MEDIUM', 'USER', 63, 10)
) AS v(block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
WHERE t.name = 'QA-инженер';

-- 4. Бизнес-аналитик
INSERT INTO adaptation_plan_templates (name, description, target_position, duration_weeks, is_system)
VALUES (
    'Бизнес-аналитик',
    'План для аналитиков: домен продукта, требования, артефакты и первые спецификации.',
    'Business Analyst',
    12,
    TRUE
);

INSERT INTO adaptation_plan_template_tasks (template_id, block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
SELECT t.id, v.block, v.description, v.acceptance_criteria, v.priority, v.acceptance_check_type, v.days_from_start, v.sort_order
FROM adaptation_plan_templates t,
(VALUES
    ('ONBOARDING', 'Пройти вводный курс в LMS', 'Тест пройден', 'HIGH', 'MACHINE', 7, 1),
    ('ONBOARDING', 'Встреча с HR и руководителем: цели испытательного срока', 'Цели согласованы', 'HIGH', 'USER', 10, 2),
    ('ONBOARDING', 'Знакомство с продуктом и ключевыми стейкхолдерами', 'Проведены intro-встречи', 'MEDIUM', 'USER', 14, 3),
    ('ONBOARDING', 'Изучить базу знаний по продукту и процессам', 'Ключевые статьи прочитаны', 'MEDIUM', 'MACHINE', 21, 4),
    ('SKILLS', 'Разобрать текущий backlog и приоритеты', 'Есть конспект по 3–5 эпикам', 'MEDIUM', 'USER', 28, 5),
    ('SKILLS', 'Освоить шаблоны ТЗ и user story в Confluence', 'Создан черновик по шаблону', 'HIGH', 'USER', 35, 6),
    ('SKILLS', 'Провести интервью с заказчиком под супервизией', 'Протокол встречи оформлен', 'MEDIUM', 'USER', 42, 7),
    ('WORK', 'Подготовить первую user story для спринта', 'Story принята в backlog', 'HIGH', 'USER', 49, 8),
    ('WORK', 'Участвовать в grooming и демо', 'Не менее 3 сессий', 'MEDIUM', 'USER', 56, 9),
    ('WORK', 'Презентовать итоги адаптации', 'Презентация проведена', 'MEDIUM', 'USER', 63, 10)
) AS v(block, description, acceptance_criteria, priority, acceptance_check_type, days_from_start, sort_order)
WHERE t.name = 'Бизнес-аналитик';
