# Backend — Naumen HR API

Spring Boot 3.4, Java 21, Maven, PostgreSQL, JWT.

## Запуск

```bash
mvn spring-boot:run
```

PostgreSQL: `jdbc:postgresql://localhost:5432/naumen_hr` (см. `src/main/resources/application.yml`).

## Тесты

```bash
mvn test
```

## Docker

Сборка из корня репозитория: `docker compose build backend`
