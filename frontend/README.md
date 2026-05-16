# Frontend — Naumen HR

React 18, TypeScript, Vite, Tailwind CSS.

## Запуск

```bash
npm install
npm run dev
```

http://localhost:5173 — прокси `/api` → backend :8080.

## Сборка

```bash
npm run build
```

## Docker

Сборка из корня: `docker compose build frontend`  
В production nginx проксирует `/api` на сервис `backend`.
