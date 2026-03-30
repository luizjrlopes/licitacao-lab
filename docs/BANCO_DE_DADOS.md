# BANCO_DE_DADOS

## Tecnologia

- PostgreSQL 16 (container `postgres`)
- Prisma ORM no backend

## Schema atual

Arquivo fonte: `backend/prisma/schema.prisma`

### Enums

- `UserRole`: `ADMIN`, `SUPPLIER`
- `NoticeStatus`: `DRAFT`, `OPEN`, `CLOSED`

### Entidades

#### User

- `id` (UUID)
- `name`
- `email` (único)
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Relacionamentos:

- 1:N com `Bid` (fornecedor)
- 1:N com `AuditLog` (ator)

#### Notice

- `id` (UUID)
- `title`
- `description`
- `status`
- `publishedAt`
- `closedAt`
- `createdAt`
- `updatedAt`

Relacionamentos:

- 1:N com `Lot`

#### Lot

- `id` (UUID)
- `noticeId` (FK)
- `code`
- `description`
- `referenceValue` (`Decimal(12,2)`)
- `createdAt`
- `updatedAt`

Restrições:

- `@@unique([noticeId, code])`
- índice por `noticeId`

#### Bid

- `id` (UUID)
- `lotId` (FK)
- `supplierId` (FK)
- `amount` (`Decimal(12,2)`)
- `isActive` (boolean)
- `createdAt`
- `updatedAt`

Índices:

- `@@index([lotId])`
- `@@index([supplierId])`
- `@@index([lotId, isActive])`

Observação:

- a unicidade lógica de proposta ativa por fornecedor/lote é garantida por regra transacional de serviço.

#### AuditLog

- `id` (UUID)
- `actorUserId` (FK)
- `action`
- `entityType`
- `entityId`
- `metadataJson` (JSON opcional)
- `createdAt`

Índices:

- `@@index([actorUserId])`
- `@@index([entityType, entityId])`

## Migrations e seed

- Migrations aplicadas por `prisma migrate deploy`.
- Seed executado por `prisma db seed` (script em `backend/prisma/seed.ts`).

## Dados iniciais (seed)

Usuários:

- `admin@lab.local` / `123456`
- `fornecedor1@lab.local` / `123456`
- `fornecedor2@lab.local` / `123456`

Dados de domínio:

- 1 edital `DRAFT`
- 1 edital `OPEN`
- 2 lotes no edital `OPEN`
- propostas ativas iniciais para ranking

## Integridade e concorrência

No fluxo de proposta:

1. desativa proposta(s) ativa(s) anterior(es) do mesmo fornecedor/lote;
2. cria nova proposta ativa;
3. executa tudo em transação com isolamento serializable e lock advisory.

Esse desenho evita inconsistência em requisições concorrentes do mesmo fornecedor no mesmo lote.
