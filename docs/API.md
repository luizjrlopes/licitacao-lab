# API

## Base URL

- Local: `http://localhost:3000`

## Formato de erro

Erros são padronizados pelo `GlobalExceptionFilter`:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Mensagem objetiva",
  "details": [],
  "method": "POST",
  "path": "/rota",
  "timestamp": "2026-03-30T00:00:00.000Z"
}
```

## Autenticação

Header esperado para rotas protegidas:

- `Authorization: Bearer <jwt>`

---

## Endpoints

### Auth

#### `POST /auth/login`

- público
- body:
  - `email: string`
  - `password: string`
- response:
  - `accessToken`
  - `user` (`id`, `name`, `email`, `role`)

### Users

#### `GET /users/me`

- protegido (`ADMIN` ou `SUPPLIER`)
- retorna usuário autenticado (dados públicos)

#### `GET /users`

- protegido (`ADMIN`)
- lista usuários (dados públicos)

### Notices

#### `POST /notices`

- protegido (`ADMIN`)
- cria edital com status inicial `DRAFT`

#### `GET /notices`

- protegido (`ADMIN` e `SUPPLIER`)
- query opcional: `status` (`DRAFT|OPEN|CLOSED`)

#### `GET /notices/:id`

- protegido (`ADMIN` e `SUPPLIER`)

#### `PATCH /notices/:id/publish`

- protegido (`ADMIN`)
- regra: apenas edital em `DRAFT`

#### `PATCH /notices/:id/close`

- protegido (`ADMIN`)
- regra: apenas edital em `OPEN`

### Lots

#### `POST /notices/:noticeId/lots`

- protegido (`ADMIN`)
- regra: não permite criar lote em edital `CLOSED`

#### `GET /notices/:noticeId/lots`

- protegido (`ADMIN` e `SUPPLIER`)

#### `GET /lots/:id`

- protegido (`ADMIN` e `SUPPLIER`)

#### `GET /lots/:id/ranking`

- protegido (`ADMIN` e `SUPPLIER`)
- ordenação: menor valor primeiro; empate por proposta mais antiga

### Bids

#### `POST /lots/:lotId/bids`

- protegido (`SUPPLIER`)
- body:
  - `amount: number` (mínimo 0.01)
- comportamento:
  - substitui proposta ativa anterior do mesmo fornecedor/lote
  - usa transação serializable + advisory lock

#### `GET /me/bids`

- protegido (`SUPPLIER`)
- lista propostas do fornecedor autenticado (com dados do lote)

### Audit

#### `GET /audit-logs?limit=100`

- protegido (`ADMIN`)
- `limit` opcional (normalizado internamente entre 1 e 200)

### Health

#### `GET /health`

- público
- resposta simples de status
