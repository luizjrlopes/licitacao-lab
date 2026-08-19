# licitacao-lab

[English](README.md) | [Português](README.pt-BR.md)

Full stack study application that simulates a public-procurement scenario, with emphasis on:

- JWT authentication;
- role-based authorization (`ADMIN` and `SUPPLIER`);
- bid submission with transactional rules and concurrency protection;
- auditing of critical actions;
- backend + frontend integration in a local Docker Compose environment.

## Stack

- Backend: NestJS + TypeScript + Prisma + PostgreSQL + Redis
- Frontend: React + TypeScript + Vite + React Router + TanStack Query
- Local infrastructure: Docker + Docker Compose

## Project structure

```txt
licitacao-lab/
	backend/
	frontend/
	docs/
	docker-compose.yml
	.env.example
	README.md
```

## Prerequisites

- Docker Desktop, or Docker Engine + Compose plugin
- Available ports: `3000`, `5173`, `5432`, `6379`

## Environment setup

1. Copy the example environment file:
   - `cp .env.example .env` (Linux/macOS)
   - `Copy-Item .env.example .env` (PowerShell)

2. Expected `.env` values:
   - `PORT=3000`
   - `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/licitacao_lab?schema=public`
   - `JWT_SECRET=supersecret`
   - `REDIS_HOST=redis`
   - `REDIS_PORT=6379`
   - `VITE_API_URL=http://localhost:3000`
   - `FRONTEND_ORIGIN=http://localhost:5173`

## Start the full environment with Docker Compose

From the repository root:

```bash
docker compose up --build -d
```

The `backend` service automatically performs:

1. Prisma Client generation;
2. migration deployment (`prisma migrate deploy`);
3. initial seed (`prisma db seed`);
4. API startup (`npm run start:dev`).

## Useful commands

```bash
docker compose ps
docker compose logs backend --tail 200
docker compose logs frontend --tail 200
docker compose down -v
docker compose up --build -d
```

## Local endpoints

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/health`

## Seeded test credentials

**ADMIN**
- email: `admin@lab.local`
- password: `123456`

**SUPPLIER 1**
- email: `fornecedor1@lab.local`
- password: `123456`

**SUPPLIER 2**
- email: `fornecedor2@lab.local`
- password: `123456`

## Manual end-to-end validation flow

1. Open the frontend at `http://localhost:5173`.
2. Sign in as a supplier (`fornecedor1@lab.local` / `123456`).
3. Open the notices and lots listing.
4. Open a lot detail page.
5. Submit a bid with a value greater than 0.
6. Confirm that the lot ranking updates.
7. Sign out and sign in as ADMIN (`admin@lab.local` / `123456`).
8. Open the audit screen and verify the recorded events, including login and bid submission/replacement.

## Main endpoints

### Auth
- `POST /auth/login`

### Users
- `GET /users/me`
- `GET /users` (ADMIN)

### Notices
- `POST /notices` (ADMIN)
- `GET /notices`
- `GET /notices/:id`
- `PATCH /notices/:id/publish` (ADMIN)
- `PATCH /notices/:id/close` (ADMIN)

### Lots
- `POST /notices/:noticeId/lots` (ADMIN)
- `GET /notices/:noticeId/lots`
- `GET /lots/:id`
- `GET /lots/:id/ranking`

### Bids
- `POST /lots/:lotId/bids` (SUPPLIER)
- `GET /me/bids` (SUPPLIER)

### Audit
- `GET /audit-logs` (ADMIN)

### Health
- `GET /health`

## Tests and builds outside containers

From `backend/`:

```bash
npm test
npm run build
```

From `frontend/`:

```bash
npm run build
```

## Important engineering details

- Bid submission uses a `Serializable` transaction and a keyed lock (`pg_advisory_xact_lock`) to reduce concurrency inconsistencies.
- When a supplier submits a new bid for the same lot, the previously active bid is deactivated (`isActive = false`) and the new one becomes active (`isActive = true`).
- The lot ranking cache is invalidated in Redis after a bid is submitted or replaced.

## Shutting down the environment

```bash
docker compose down
# or, removing volumes:
docker compose down -v
```
