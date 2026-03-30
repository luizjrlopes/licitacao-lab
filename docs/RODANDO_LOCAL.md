# RODANDO_LOCAL

## Pré-requisitos

- Docker Desktop (ou Docker Engine + Docker Compose plugin)
- portas livres: `3000`, `5173`, `5432`, `6379`

## 1) Preparar variáveis de ambiente

Na raiz do projeto, copiar `.env.example` para `.env`.

Valores relevantes:

- `PORT=3000`
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/licitacao_lab?schema=public`
- `JWT_SECRET=supersecret`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `VITE_API_URL=http://localhost:3000`
- `FRONTEND_ORIGIN=http://localhost:5173`

## 2) Subir ambiente completo

Na raiz:

- `docker compose up --build -d`

No backend, o `command` do compose executa automaticamente:

1. `prisma generate`
2. `prisma migrate deploy`
3. `prisma db seed`
4. `npm run start:dev`

## 3) Verificar serviços

- `docker compose ps`
- backend deve ficar `healthy`
- postgres e redis devem ficar `healthy`

Acessos:

- frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- health: `http://localhost:3000/health`

## 4) Validar fluxo funcional mínimo

Credenciais seed:

- `admin@lab.local` / `123456`
- `fornecedor1@lab.local` / `123456`
- `fornecedor2@lab.local` / `123456`

Fluxo sugerido:

1. login como fornecedor;
2. acessar editais/lotes;
3. abrir detalhe de lote;
4. enviar proposta;
5. consultar ranking;
6. login como admin;
7. abrir auditoria.

## 5) Comandos úteis

- logs backend: `docker compose logs backend --tail 200`
- logs frontend: `docker compose logs frontend --tail 200`
- rebuild limpo:
  - `docker compose down -v`
  - `docker compose up --build -d`

## Troubleshooting básico

## Backend não sobe e frontend sobe

1. Ver logs:
   - `docker compose logs backend --tail 200`
2. Verificar se postgres/redis estão `healthy`.
3. Confirmar variáveis do `.env`.

## Problema de Prisma no container

Sintoma comum: falha no `prisma migrate deploy`.

No estado atual do projeto, o `backend/Dockerfile` já instala `openssl` para compatibilidade do engine do Prisma.

## Erro 401 em rotas protegidas

1. validar se login foi feito e token existe no `localStorage`;
2. validar envio do header `Authorization` no frontend (`services/api.ts`).

## CORS no navegador

- backend usa `FRONTEND_ORIGIN` (padrão `http://localhost:5173`);
- confirmar domínio/porta do frontend compatíveis.

## Dados inconsistentes para teste manual

- reset completo:
  - `docker compose down -v`
  - `docker compose up --build -d`

Isso recria banco e reaplica seed.
