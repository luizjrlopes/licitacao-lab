# ARQUITETURA

## Visão geral

O `licitacao-lab` é um monorepo didático, com arquitetura simples em camadas:

- `frontend` (React + Vite) para interface;
- `backend` (NestJS) para regras de negócio e API REST;
- `postgres` para persistência principal;
- `redis` para cache de ranking.

A comunicação principal acontece via HTTP:

- navegador → frontend (`:5173`)
- frontend → backend (`:3000`)
- backend → postgres (`:5432`) e redis (`:6379`)

## Organização do monorepo

```txt
projeto2/
  backend/
  frontend/
  docs/
  docker-compose.yml
  .env.example
  README.md
```

## Backend (alto nível)

O backend usa NestJS modular, com os módulos:

- `auth` (login JWT);
- `users` (`/users/me`, `/users`);
- `notices` (edital);
- `lots` (lotes e ranking);
- `bids` (envio de proposta e histórico do fornecedor);
- `audit` (registro e consulta de auditoria);
- `health` (`/health`);
- `prisma` (acesso ao banco);
- `redis` (cache simples).

Padrão aplicado:

- `Controller`: contrato HTTP;
- `Service`: regras de negócio;
- `DTO`: validação de entrada;
- `Guard`: autenticação e autorização.

## Frontend (alto nível)

O frontend usa React Router para navegação e TanStack Query para dados.

Rotas principais:

- `/login`
- `/notices`
- `/lots/:id`
- `/audit-logs`

A autenticação é feita por token JWT armazenado em `localStorage`, com envio automático no header `Authorization: Bearer ...`.

## Banco de dados e cache

- PostgreSQL é a fonte de verdade para domínio (`User`, `Notice`, `Lot`, `Bid`, `AuditLog`).
- Redis é usado como cache de ranking de lote com TTL curto (30 segundos).

## Decisões técnicas principais

1. **Monólito modular** (NestJS) para facilitar estudo e leitura.
2. **Prisma + PostgreSQL** por simplicidade e tipagem.
3. **JWT + roles explícitas** para autenticação/autorização direta.
4. **Transação serializable + advisory lock** em envio de proposta para prevenção de inconsistência concorrente.
5. **Docker Compose** como forma única de execução local ponta a ponta.

## Fluxo arquitetural resumido

1. Usuário faz login no frontend.
2. Frontend chama `POST /auth/login` e guarda JWT.
3. Frontend consome endpoints protegidos com JWT.
4. Backend valida JWT e role (`JwtAuthGuard` + `RolesGuard`).
5. Regras de negócio são aplicadas no service.
6. PostgreSQL persiste estado; Redis acelera leitura de ranking.
7. Ações críticas geram registros em `AuditLog`.
