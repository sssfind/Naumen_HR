# Naumen HR

Монорепозиторий: **backend** (Spring Boot API) и **frontend** (React + Vite).

```
Naumen_HR/
├── backend/          # Java 21, Maven, PostgreSQL
├── frontend/         # React 18, TypeScript, Vite, Tailwind
├── docker-compose.yml
└── .env              # переменные для Docker (скопировать из .env.example)
```

## Быстрый старт (Docker)

```bash
cp .env.example .env
# задайте JWT_SECRET в .env
docker compose up --build
```

| Сервис   | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8080      |
| Swagger  | http://localhost:8080/swagger-ui.html |

## Локальная разработка

### Backend

```bash
cd backend
mvn spring-boot:run
```

Нужны: JDK 21, Maven 3.9+, PostgreSQL (`docker compose up -d postgres`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173 — запросы `/api` проксируются на backend (см. `frontend/vite.config.ts`).

## Сборка

```bash
cd backend && mvn -DskipTests package
cd frontend && npm run build
```

## Конфигурация

Корневой `.env` — для `docker compose` (backend).  
`frontend/.env.example` — для локального Vite (опционально).

| Переменная | Описание |
|------------|----------|
| `JWT_SECRET` | Секрет JWT (≥ 32 символов) |
| `SPRING_DATASOURCE_*` | Подключение к PostgreSQL |
| `ALLOWED_EMAIL_DOMAIN` | Домен почты (по умолчанию `naumen.ru`) |
