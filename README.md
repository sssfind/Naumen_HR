# NAU-START — система адаптации стажёров

Веб-сервис (MVP) для комфортного прохождения испытательного срока новыми сотрудниками и эффективного сопровождения процесса отделом кадров и наставниками.

## Содержание

- [Реализация в этом репозитории](#реализация-в-этом-репозитории)
- [Возможности по ролям](#возможности-по-ролям)
- [Роли пользователей](#роли-пользователей)
- [Стек технологий](#стек-технологий)
- [Структура репозитория](#структура-репозитория)
- [Быстрый старт (Docker)](#быстрый-старт-docker)
- [Локальная разработка](#локальная-разработка)
- [Переменные окружения](#переменные-окружения)
- [Демо-данные (seeder)](#демо-данные-seeder)
- [API и документация](#api-и-документация)
- [Сборка отдельных образов](#сборка-отдельных-образов)

---

## Реализация в этом репозитории

| Требование | Статус |
|------------|--------|
| План пути (3 блока, задачи, прогресс, календарь) | реализовано |
| Напоминания о шагах и опросах | реализовано (cron + уведомления в UI) |
| Справочник «Кто есть кто» + дерево отделов | реализовано |
| Еженедельный опрос обратной связи | реализовано |
| Панель HR: шаблоны планов, стажёры, проверка задач, аналитика | реализовано |
| Безопасность: JWT, домен `@naumen.ru` | реализовано |
| Чат-ассистент (OpenRouter) | реализовано |
| Sentiment analysis и риски для HR | реализовано |
| Геймификация (достижения в профиле) | частично |
| Интеграции Slack / Jira / HR-системы | не реализовано |

---

## Возможности по ролям

### Для стажёра (`ROLE_TRAINEE`)

- Личный дашборд с прогрессом по блокам адаптации (3 этапа).
- Задачи: старт, выполнение, комментарии; календарь и просмотр блоков.
- Еженедельный опрос обратной связи (оценка недели, ясность задач, наставник, ресурсы, комментарий).
- Справочник сотрудников компании, профиль и достижения.
- Чат-помощник (OpenRouter).

### Для HR и наставника (`ROLE_HR`, `ROLE_MENTOR`)

- Список закреплённых стажёров, назначение HR/наставника.
- Редактирование индивидуального плана адаптации и применение шаблонов.
- Проверка задач стажёров (approve / reject).
- Просмотр истории еженедельной обратной связи.
- Аналитика адаптации: риски по опросам, просроченные задачи, ожидающие опросы.
- Шаблоны планов адаптации, дерево подразделений, сотрудники.
- Уведомления в приложении.

### Аналитика и риски

При отправке опроса система:

1. Считает структурированный sentiment по шкалам и рейтингам.
2. Анализирует текст комментария (ключевые слова + при наличии ключа — LLM через OpenRouter).
3. Выставляет метки риска для дашборда HR (просрочки, низкие оценки, негатив в комментариях и т.д.).

### Фоновые процессы

- Планировщик напоминаний (cron, по умолчанию 09:00): задачи «скоро срок», еженедельный опрос, синхронизация с фронтендом.

---

## Роли пользователей

| Роль | Описание | Основной UI |
|------|----------|-------------|
| `ROLE_TRAINEE` | Стажёр | `/dashboard/trainee` |
| `ROLE_HR` | HR-специалист | `/dashboard/hr` |
| `ROLE_MENTOR` | Наставник | `/dashboard/mentor` |
| `ROLE_EMPLOYEE` | Сотрудник (справочник) | без отдельного кабинета |

Регистрация через API/UI доступна только для корпоративных email домена, заданного в `ALLOWED_EMAIL_DOMAIN` (по умолчанию `naumen.ru`).

---

## Стек технологий

| Слой | Технологии |
|------|------------|
| **Backend** | Java 21, Spring Boot 3.4, Spring Security (JWT), JPA, Flyway, PostgreSQL 16 |
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, TanStack Query, React Router |
| **Инфраструктура** | Docker Compose, Nginx (prod frontend), Actuator |
| **Seeder** | Go 1.23, pgx |
| **LLM** | OpenRouter API (чат и анализ комментариев в опросах) |

---

## Структура репозитория

```
Naumen_HR/
├── backend/          # Spring Boot API
│   ├── src/main/java/ru/naumen/experts/
│   │   ├── auth/         # JWT, регистрация, вход
│   │   ├── trainee/      # API стажёра
│   │   ├── traineeplan/  # планы и задачи
│   │   ├── template/     # шаблоны планов
│   │   ├── feedback/     # опросы и sentiment
│   │   ├── hr/             # HR API и дашборды
│   │   ├── department/     # оргструктура
│   │   ├── notification/   # уведомления
│   │   ├── chat/           # OpenRouter
│   │   └── reminder/       # напоминания
│   └── src/main/resources/db/migration/
├── frontend/         # React SPA
├── seeder/           # демо-данные в PostgreSQL
├── docker-compose.yml
├── .env.example
└── README.md
```

Подробности по backend: [backend/README.md](backend/README.md).

---

## Быстрый старт (Docker)

### Требования

- Docker и Docker Compose
- Файл `.env` в корне (скопируйте из `.env.example`)

### Шаги

```bash
# из корня репозитория
cp .env.example .env
# отредактируйте JWT_SECRET и при необходимости OPENROUTER_API_KEY

docker compose up --build
```

После старта:

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| PostgreSQL | `localhost:5432` (БД `naumen_hr`, user/pass `naumen`) |
| Health | http://localhost:8080/actuator/health |

Сервис `seeder` один раз заполняет БД демо-пользователями и сценариями (см. [Демо-данные](#демо-данные-seeder)).

Остановка:

```bash
docker compose down
# с удалением тома БД:
docker compose down -v
```

---

## Локальная разработка

### 1. PostgreSQL

```bash
docker compose up postgres -d
```

Либо свой экземпляр PostgreSQL 16 с БД `naumen_hr` и учёткой из `application.yml`.

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

По умолчанию: http://localhost:8080  
Swagger UI (только без профиля `prod`): http://localhost:8080/swagger-ui.html

### 3. Frontend

```bash
cd frontend
npm ci
npm run dev
```

Приложение: http://localhost:5173  
Запросы к `/api` проксируются на `http://localhost:8080` (см. `frontend/vite.config.ts`).

Опционально создайте `frontend/.env` по образцу `frontend/.env.example`.

### 4. Демо-данные (локально)

После миграций Flyway и запущенного backend:

```bash
cd seeder
# DATABASE_URL=postgres://naumen:naumen@localhost:5432/naumen_hr?sslmode=disable
go run .
```

Или через Compose: `docker compose run --rm seeder`.

---

## Переменные окружения

Корневой `.env` (для Docker backend):

| Переменная | Описание | Пример |
|------------|----------|--------|
| `SPRING_DATASOURCE_URL` | JDBC URL | `jdbc:postgresql://postgres:5432/naumen_hr` |
| `SPRING_DATASOURCE_USERNAME` | Пользователь БД | `naumen` |
| `SPRING_DATASOURCE_PASSWORD` | Пароль БД | `naumen` |
| `JWT_SECRET` | Секрет JWT (≥ 32 символов) | случайная строка |
| `JWT_EXPIRATION_MS` | Время жизни токена, мс | `86400000` (24 ч) |
| `ALLOWED_EMAIL_DOMAIN` | Домен для регистрации/входа | `naumen.ru` |
| `SPRING_PROFILES_ACTIVE` | Профиль Spring | `prod` / не задавать локально |
| `APP_CORS_ALLOWED_ORIGINS` | CORS (через запятую) | origins фронтенда |
| `OPENROUTER_API_KEY` | Ключ OpenRouter (чат + LLM sentiment) | опционально |
| `OPENROUTER_MODEL` | Модель | `openai/gpt-4o-mini` |
| `REMINDERS_ENABLED` | Включить cron-напоминания | `true` |
| `REMINDERS_CRON` | Расписание | `0 0 9 * * *` |

Frontend (сборка / dev):

| Переменная | Описание |
|------------|----------|
| `VITE_API_BASE_URL` | Базовый URL API (в Docker: `/api/v1`) |
| `VITE_API_PROXY_TARGET` | Цель прокси Vite dev (`http://localhost:8080`) |

---

## Демо-данные (seeder)

После выполнения seeder доступны учётные записи:

| Шаблон email | Роль | Пароль |
|--------------|------|--------|
| `hr1@naumen.ru` … `hr3@naumen.ru` | HR | `123123123` |
| `mentor1@naumen.ru` … | Наставник | `123123123` |
| `trainee1@naumen.ru` … `trainee10@naumen.ru` | Стажёр | `123123123` |
| `emp1@naumen.ru` … | Сотрудник | `123123123` |

Сценарии для проверки:

- **trainee1** — успешная адаптация.
- **trainee2** — повышенный риск (для дашборда HR).
- **trainee4** — новичок, текущий опрос не заполнен.
- У **trainee1** и **trainee2** текущая неделя опроса может быть не заполнена (для теста напоминаний).

Seeder также создаёт подразделения, шаблоны планов, задачи с разными статусами, историю опросов и уведомления.

---

## API и документация

Базовый префикс: **`/api/v1`**

### Аутентификация

- `POST /api/v1/auth/register` — регистрация (корпоративный email).
- `POST /api/v1/auth/login` — вход, JWT в ответе.
- `GET /api/v1/auth/me` — текущий пользователь (заголовок `Authorization: Bearer <token>`).
- `POST /api/v1/auth/logout` — выход (клиент удаляет токен).

### Основные группы эндпоинтов

| Префикс | Назначение |
|---------|------------|
| `/api/v1/trainee/**` | Дашборд, задачи, опрос, сотрудники |
| `/api/v1/hr/**` | Стажёры, планы, шаблоны, статистика, feedback |
| `/api/v1/departments/**` | Дерево подразделений |
| `/api/v1/employees` | Справочник (HR, Mentor) |
| `/api/v1/notifications` | Уведомления |
| `/api/v1/chat` | Чат с LLM |
| `/actuator/health` | Health check (без авторизации) |

В режиме разработки: OpenAPI — `/v3/api-docs`, UI — `/swagger-ui.html`.  
В профиле `prod` Swagger отключён (`application-prod.yml`).

---

## Сборка отдельных образов

```bash
# только backend
docker compose build backend

# только frontend
docker compose build frontend
```
