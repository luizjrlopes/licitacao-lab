# REDIS

## Objetivo no projeto

O Redis é usado de forma simples para **cache de ranking de lote**.

Implementação principal:

- `backend/src/redis/redis.service.ts`
- `backend/src/lots/lots.service.ts`
- `backend/src/bids/bids.service.ts`

## Como o cache é usado

### Leitura de ranking

No `LotsService.getRanking(id)`:

1. tenta ler `ranking:lot:<id>` no Redis;
2. se existir, retorna cache;
3. se não existir, consulta PostgreSQL, monta ranking, grava cache e retorna.

TTL aplicado:

- `30` segundos.

### Invalidação

No `BidsService.create(...)`, após commit da transação de proposta:

- remove chave `ranking:lot:<lotId>`.

Isso força recálculo no próximo `GET /lots/:id/ranking`.

## Estratégia de falha

`RedisService` opera como **best effort**:

- se Redis não conectar no bootstrap, backend continua funcionando sem cache;
- falhas em `get/set/del` não derrubam fluxo principal.

Essa decisão mantém disponibilidade do sistema para estudo.

## Configuração por ambiente

Variáveis relevantes:

- `REDIS_HOST` (default esperado: `redis`)
- `REDIS_PORT` (default esperado: `6379`)

No Docker Compose:

- serviço `redis` em `redis:7-alpine`
- porta `6379`

## Benefício prático

- reduz leituras repetidas de ranking em curto intervalo;
- mantém simplicidade didática sem introduzir complexidade adicional.
