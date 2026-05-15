# Naumen HR

Backend API (Spring Boot 3, Java 21) — аутентификация пользователей с JWT и ролями `ROLE_EMPLOYEE` / `ROLE_HR`.

## Требования

- JDK 21
- Maven 3.9+
- PostgreSQL 16 (локально или через Docker)

## Локальный запуск

### 1. База данных

```bash
docker compose up -d postgres
```

### 2. Переменные окружения

Скопируйте пример и при необходимости измените секрет:

```bash
cp .env.example .env
```

Для локального запуска без Docker достаточно задать `JWT_SECRET` (≥ 32 символов).

### 3. Приложение

```bash
mvn spring-boot:run
```

API: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html  
Health: http://localhost:8080/actuator/health

## Запуск в Docker (app + postgres)

```bash
cp .env.example .env
# отредактируйте JWT_SECRET в .env
docker compose up --build
```

## Сборка JAR

```bash
mvn -DskipTests package
java -jar target/naumen-hr-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход, выдача JWT |
| GET | `/api/v1/auth/me` | Текущий пользователь (Bearer JWT) |
| POST | `/api/v1/auth/logout` | Выход (удалить токен на клиенте) |

Регистрация и вход допускают только email с доменом из `ALLOWED_EMAIL_DOMAIN` (по умолчанию `naumen.ru`).

## Конфигурация

| Переменная | Описание |
|------------|----------|
| `SPRING_DATASOURCE_URL` | JDBC URL PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Пользователь БД |
| `SPRING_DATASOURCE_PASSWORD` | Пароль БД |
| `JWT_SECRET` | Секрет подписи JWT (обязательно сменить в prod) |
| `JWT_EXPIRATION_MS` | Срок жизни токена, мс (по умолчанию 86400000) |
| `ALLOWED_EMAIL_DOMAIN` | Домен корпоративной почты |
| `SERVER_PORT` | Порт HTTP (по умолчанию 8080) |
| `SPRING_PROFILES_ACTIVE` | `prod` отключает Swagger UI |

## Тесты

```bash
mvn test
```
