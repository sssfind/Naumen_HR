-- Seed employee profiles for expertise map:
-- 1) Skills dictionary
-- 2) Readiness status on users
-- 3) User skills with proficiency/readiness/stars
-- 4) Event history and participation experience

-- =========================
-- Skills dictionary
-- =========================
INSERT INTO skills (name, category, is_active, created_at)
VALUES
    ('Java', 'PROFESSIONAL', TRUE, NOW()),
    ('Spring Boot', 'PROFESSIONAL', TRUE, NOW()),
    ('SQL', 'PROFESSIONAL', TRUE, NOW()),
    ('PostgreSQL', 'PROFESSIONAL', TRUE, NOW()),
    ('React', 'PROFESSIONAL', TRUE, NOW()),
    ('TypeScript', 'PROFESSIONAL', TRUE, NOW()),
    ('Testing', 'PROFESSIONAL', TRUE, NOW()),
    ('DevOps', 'PROFESSIONAL', TRUE, NOW()),
    ('System Design', 'PROFESSIONAL', TRUE, NOW()),
    ('Business Analysis', 'PROFESSIONAL', TRUE, NOW()),
    ('Public Speaking', 'EXPERT', TRUE, NOW()),
    ('Mentoring', 'EXPERT', TRUE, NOW()),
    ('Jury Work', 'EXPERT', TRUE, NOW()),
    ('Lecture Delivery', 'EXPERT', TRUE, NOW()),
    ('Facilitation', 'EXPERT', TRUE, NOW())
ON CONFLICT (name) DO NOTHING;

-- =========================
-- Seed events
-- =========================
INSERT INTO events (title, event_type, event_date, organizer, description, created_at)
VALUES
    ('Java Guild Meetup', 'MEETUP', CURRENT_DATE - 120, 'Naumen Engineering', 'Internal knowledge sharing on Java ecosystem', NOW()),
    ('Spring Architecture Day', 'CONFERENCE', CURRENT_DATE - 105, 'Naumen Engineering', 'Best practices in Spring Boot services', NOW()),
    ('Testing Bootcamp', 'WORKSHOP', CURRENT_DATE - 98, 'QA Chapter', 'Practical session on automated testing', NOW()),
    ('Product Discovery Session', 'WORKSHOP', CURRENT_DATE - 84, 'Product Office', 'Cross-functional product discovery techniques', NOW()),
    ('Mentor Academy', 'TRAINING', CURRENT_DATE - 70, 'People Development', 'Mentor skills and coaching techniques', NOW()),
    ('Expert Talks Week', 'LECTURE', CURRENT_DATE - 56, 'Internal Communications', 'Series of internal expert talks', NOW()),
    ('Hackathon Naumen', 'HACKATHON', CURRENT_DATE - 42, 'Innovation Lab', 'Company-wide engineering hackathon', NOW()),
    ('Architecture Review Board', 'COMMITTEE', CURRENT_DATE - 35, 'CTO Office', 'Architecture review and decisions', NOW()),
    ('Data Platform Forum', 'FORUM', CURRENT_DATE - 28, 'Data Team', 'Data practices and platform updates', NOW()),
    ('Frontend Community Day', 'MEETUP', CURRENT_DATE - 21, 'Frontend Chapter', 'Frontend standards and demos', NOW()),
    ('Customer Success Roundtable', 'ROUNDTABLE', CURRENT_DATE - 14, 'Customer Success', 'Case studies and client feedback', NOW()),
    ('Expert Network Day', 'CONFERENCE', CURRENT_DATE - 7, 'HR', 'Expert network and competency exchange', NOW());

-- =========================
-- Employee readiness status
-- =========================
WITH employees AS (
    SELECT
        id,
        ((regexp_match(email, '^employee([0-9]{2})@naumen\.ru$'))[1])::INT AS employee_no
    FROM users
    WHERE email ~ '^employee[0-9]{2}@naumen\.ru$'
)
UPDATE users u
SET readiness_status = CASE
    WHEN e.employee_no % 5 = 0 THEN 'NOT_READY'::readiness_status
    WHEN e.employee_no % 2 = 0 THEN 'READY'::readiness_status
    ELSE 'OPEN'::readiness_status
END
FROM employees e
WHERE u.id = e.id;

-- =========================
-- User skills and expertise levels
-- =========================
WITH employees AS (
    SELECT
        id,
        ((regexp_match(email, '^employee([0-9]{2})@naumen\.ru$'))[1])::INT AS employee_no
    FROM users
    WHERE email ~ '^employee[0-9]{2}@naumen\.ru$'
),
skill_rows AS (
    SELECT
        e.id AS user_id,
        row_data.skill_name,
        row_data.proficiency_level,
        row_data.readiness_status,
        row_data.stars,
        row_data.notes
    FROM employees e
    CROSS JOIN LATERAL (
        VALUES
            (
                CASE WHEN e.employee_no % 2 = 0 THEN 'Java' ELSE 'React' END,
                CASE WHEN e.employee_no % 3 = 0 THEN 'EXPERT'::proficiency_level ELSE 'CONFIDENT'::proficiency_level END,
                CASE WHEN e.employee_no % 4 = 0 THEN 'READY'::readiness_status ELSE 'OPEN'::readiness_status END,
                3 + (e.employee_no % 3),
                'Primary stack skill from seed profile'
            ),
            (
                'Spring Boot',
                CASE WHEN e.employee_no % 5 = 0 THEN 'BASIC'::proficiency_level ELSE 'CONFIDENT'::proficiency_level END,
                CASE WHEN e.employee_no % 6 = 0 THEN 'READY'::readiness_status ELSE 'OPEN'::readiness_status END,
                2 + (e.employee_no % 4),
                'Backend framework proficiency'
            ),
            (
                'SQL',
                CASE WHEN e.employee_no % 4 = 0 THEN 'EXPERT'::proficiency_level ELSE 'CONFIDENT'::proficiency_level END,
                'OPEN'::readiness_status,
                3 + (e.employee_no % 3),
                'Database querying skills'
            ),
            (
                CASE WHEN e.employee_no % 3 = 0 THEN 'Public Speaking' ELSE 'Mentoring' END,
                CASE WHEN e.employee_no % 7 = 0 THEN 'EXPERT'::proficiency_level ELSE 'CONFIDENT'::proficiency_level END,
                CASE WHEN e.employee_no % 2 = 0 THEN 'READY'::readiness_status ELSE 'OPEN'::readiness_status END,
                2 + (e.employee_no % 4),
                'Expert contribution skill'
            )
    ) AS row_data(skill_name, proficiency_level, readiness_status, stars, notes)
)
INSERT INTO user_skill (user_id, skill_id, proficiency_level, readiness_status, stars, notes, updated_at)
SELECT
    sr.user_id,
    s.id,
    sr.proficiency_level,
    sr.readiness_status,
    sr.stars,
    sr.notes,
    NOW() - ((sr.user_id % 15) || ' days')::INTERVAL
FROM skill_rows sr
JOIN skills s ON s.name = sr.skill_name
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- =========================
-- User event experience
-- =========================
WITH employees AS (
    SELECT
        id,
        ((regexp_match(email, '^employee([0-9]{2})@naumen\.ru$'))[1])::INT AS employee_no
    FROM users
    WHERE email ~ '^employee[0-9]{2}@naumen\.ru$'
),
seed_events AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY event_date, id) AS event_no
    FROM events
    WHERE title IN (
        'Java Guild Meetup',
        'Spring Architecture Day',
        'Testing Bootcamp',
        'Product Discovery Session',
        'Mentor Academy',
        'Expert Talks Week',
        'Hackathon Naumen',
        'Architecture Review Board',
        'Data Platform Forum',
        'Frontend Community Day',
        'Customer Success Roundtable',
        'Expert Network Day'
    )
),
experience_rows AS (
    SELECT
        e.id AS user_id,
        ev1.id AS event_id,
        CASE WHEN e.employee_no % 2 = 0 THEN 'SPEAKER'::participation_role ELSE 'PARTICIPANT'::participation_role END AS participation_role,
        CASE
            WHEN e.employee_no % 9 = 0 THEN 'WINNER'::result_level
            WHEN e.employee_no % 3 = 0 THEN 'SHORTLIST'::result_level
            ELSE 'NONE'::result_level
        END AS result_level,
        'Primary seeded participation record' AS feedback
    FROM employees e
    JOIN seed_events ev1 ON ev1.event_no = ((e.employee_no - 1) % 6) + 1

    UNION ALL

    SELECT
        e.id AS user_id,
        ev2.id AS event_id,
        CASE WHEN e.employee_no % 2 = 0 THEN 'MENTOR'::participation_role ELSE 'JURY'::participation_role END AS participation_role,
        CASE
            WHEN e.employee_no % 10 = 0 THEN 'WINNER'::result_level
            WHEN e.employee_no % 4 = 0 THEN 'SHORTLIST'::result_level
            ELSE 'NONE'::result_level
        END AS result_level,
        'Secondary seeded participation record' AS feedback
    FROM employees e
    JOIN seed_events ev2 ON ev2.event_no = ((e.employee_no - 1) % 6) + 7
)
INSERT INTO user_event_experience (user_id, event_id, participation_role, result_level, feedback, created_at)
SELECT
    er.user_id,
    er.event_id,
    er.participation_role,
    er.result_level,
    er.feedback,
    NOW() - ((er.user_id % 20) || ' days')::INTERVAL
FROM experience_rows er
ON CONFLICT (user_id, event_id, participation_role) DO NOTHING;
