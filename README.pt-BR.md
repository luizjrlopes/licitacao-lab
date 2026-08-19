# licitacao-lab

[English](README.md) | [Português](README.pt-BR.md)

Aplicação full stack de estudo para simular um cenário de licitação pública, com foco em:

- autenticação JWT;
- autorização por perfis (`ADMIN` e `SUPPLIER`);
- envio de proposta com regra transacional e proteção de concorrência;
- auditoria de ações críticas;
- integração backend + frontend em ambiente local com Docker Compose.

## Stack

- Backend: NestJS + TypeScript + Prisma + PostgreSQL + Redis
- Frontend: React + TypeScript + Vite + React Router + TanStack Query
- Infra local: Docker + Docker Compose

## Estrutura do projeto

```txt
licitacao-lab/
	backend/
	frontend/
	docs/
	docker-compose.yml
	.env.example
	README.md
```

## Pré-requisitos

- Docker Desktop (ou Docker Engine + Compose plugin)
- Portas livres: `3000`, `5173`, `5432`, `6379`

## Configuração de ambiente

1. Copie o arquivo de exemplo para uso local:
   - `cp .env.example .env` (Linux/macOS)
   - `Copy-Item .env.example .env` (PowerShell)

2. Valores esperados no `.env`:
   - `PORT=3000`
   - `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/licitacao_lab?schema=public`
   - `JWT_SECRET=supersecret`
   - `REDIS_HOST=redis`
   - `REDIS_PORT=6379`
   - `VITE_API_URL=http://localhost:3000`
   - `FRONTEND_ORIGIN=http://localhost:5173`

## Subir tudo com Docker Compose

No diretório raiz:

```bash
docker compose up --build -d
```

O serviço `backend` executa automaticamente:

1. geração do Prisma Client;
2. aplicação de migrations (`prisma migrate deploy`);
3. seed inicial (`prisma db seed`);
4. inicialização da API (`npm run start:dev`).

## Comandos úteis

```bash
docker compose ps
docker compose logs backend --tail 200
docker compose logs frontend --tail 200
docker compose down -v
docker compose up --build -d
```

## Acessos

- Frontend: `http://localhost:5173`
- API backend: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/health`

## Credenciais de teste (seed)

**ADMIN**
- email: `admin@lab.local`
- senha: `123456`

**SUPPLIER 1**
- email: `fornecedor1@lab.local`
- senha: `123456`

**SUPPLIER 2**
- email: `fornecedor2@lab.local`
- senha: `123456`

## Fluxo manual de validação ponta a ponta

1. Abra o frontend em `http://localhost:5173`.
2. Faça login com um fornecedor (`fornecedor1@lab.local` / `123456`).
3. Acesse a listagem de editais e lotes.
4. Entre no detalhe de um lote.
5. Envie uma proposta com valor > 0.
6. Confira atualização do ranking do lote.
7. Faça logout e login com ADMIN (`admin@lab.local` / `123456`).
8. Acesse a tela de auditoria e valide os eventos (login, envio/substituição de proposta, etc.).

## Endpoints principais

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

## Testes e build fora dos containers

No `backend/`:

```bash
npm test
npm run build
```

No `frontend/`:

```bash
npm run build
```

## Observações técnicas importantes

- A regra de envio de proposta usa transação com isolamento `Serializable` e lock por chave (`pg_advisory_xact_lock`) para reduzir risco de inconsistência em concorrência.
- Quando um fornecedor envia nova proposta para o mesmo lote, a proposta anterior ativa é desativada (`isActive = false`) e a nova entra como ativa (`isActive = true`).
- O ranking de lote é invalidado no Redis após envio/substituição de proposta.

## Encerramento do ambiente

```bash
docker compose down
# ou, removendo volumes:
docker compose down -v
```
