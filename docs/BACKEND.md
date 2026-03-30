# BACKEND

## Stack e execução

- Node.js
- TypeScript
- NestJS
- Prisma ORM
- PostgreSQL
- Redis

O backend expõe a API em `http://localhost:3000`.

## Estrutura principal

```txt
backend/src/
  app.module.ts
  main.ts
  auth/
  users/
  notices/
  lots/
  bids/
  audit/
  health/
  prisma/
  redis/
  common/
```

## Bootstrap (`main.ts`)

No startup são configurados:

- `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`);
- `RequestLoggingInterceptor` global;
- `GlobalExceptionFilter` global;
- CORS baseado em `FRONTEND_ORIGIN` (default `http://localhost:5173`).

## Módulos funcionais

### Auth

- Controller: `POST /auth/login`
- Service: valida credenciais com `bcryptjs.compareSync`, gera JWT com `JwtService` e registra auditoria de login.

### Users

- `GET /users/me` (ADMIN e SUPPLIER)
- `GET /users` (ADMIN)

### Notices

- `POST /notices` (ADMIN)
- `GET /notices` (ADMIN e SUPPLIER)
- `GET /notices/:id` (ADMIN e SUPPLIER)
- `PATCH /notices/:id/publish` (ADMIN)
- `PATCH /notices/:id/close` (ADMIN)

Regras de status:

- `DRAFT -> OPEN` para publicar;
- `OPEN -> CLOSED` para encerrar.

### Lots

- `POST /notices/:noticeId/lots` (ADMIN)
- `GET /notices/:noticeId/lots` (ADMIN e SUPPLIER)
- `GET /lots/:id` (ADMIN e SUPPLIER)
- `GET /lots/:id/ranking` (ADMIN e SUPPLIER)

### Bids

- `POST /lots/:lotId/bids` (SUPPLIER)
- `GET /me/bids` (SUPPLIER)

### Audit

- `GET /audit-logs` (ADMIN)

### Health

- `GET /health`

## Segurança

Guardas aplicados por controller/rota:

- `JwtAuthGuard`: autenticação via JWT;
- `RolesGuard`: autorização por role definida no decorator `@Roles(...)`.

## Tratamento de erros

`GlobalExceptionFilter` padroniza resposta:

- `statusCode`
- `error`
- `message`
- `details` (quando validação)
- `method`
- `path`
- `timestamp`

Também registra log de warning/error conforme status.

## Logs de request

`RequestLoggingInterceptor` registra:

- método
- rota
- status
- duração (`durationMs`)

## Observações de implementação

- O endpoint de proposta (`POST /lots/:lotId/bids`) é o ponto crítico de concorrência.
- Após envio/substituição de proposta, o cache de ranking do lote é invalidado.
- Ações críticas (login, notice/lot/bid) geram auditoria no banco.
