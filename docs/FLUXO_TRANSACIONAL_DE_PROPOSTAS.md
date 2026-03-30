# FLUXO_TRANSACIONAL_DE_PROPOSTAS

## Objetivo do fluxo

Garantir que cada fornecedor tenha no máximo **uma proposta ativa** por lote, mesmo sob concorrência.

Endpoint envolvido:

- `POST /lots/:lotId/bids` (SUPPLIER)

Implementação principal:

- `backend/src/bids/bids.service.ts` (`create`)

## Regras de negócio aplicadas

1. Usuário precisa ser `SUPPLIER`.
2. Lote precisa existir.
3. Edital do lote precisa estar `OPEN`.
4. Nova proposta substitui proposta ativa anterior do mesmo fornecedor no mesmo lote.

## Estratégia de concorrência

Dentro de uma transação Prisma com isolamento serializable:

- `Prisma.TransactionIsolationLevel.Serializable`

é executado lock transacional no PostgreSQL:

```sql
SELECT pg_advisory_xact_lock(hashtext(lockKey)::bigint)
```

Onde `lockKey` é formado por:

- `${lotId}:${actor.sub}`

Isso serializa as operações concorrentes para o mesmo par lote/fornecedor durante a transação.

## Sequência transacional

1. Valida contexto (role, lote, status do edital).
2. Inicia transação serializable.
3. Aplica advisory lock por lote+fornecedor.
4. `updateMany` para `isActive=false` nas propostas ativas antigas.
5. `create` de nova proposta com `isActive=true`.
6. Registra auditoria (`BID_CREATE` ou `BID_REPLACE`) dentro da transação.
7. Commit.
8. Invalida cache de ranking no Redis (`ranking:lot:<id>`).

## Auditoria do fluxo

Ação gravada:

- `BID_CREATE` (sem proposta ativa anterior)
- `BID_REPLACE` (quando substituiu)

Payload inclui:

- `lotId`
- `supplierId`
- `amount`
- `replacedPrevious`

## Tratamento de erro

- Lote inexistente → `404`
- Edital não `OPEN` → `400`
- Role inválida → `400`
- Violação de unicidade (P2002) → `400` com mensagem específica
- Outros erros sobem para o filtro global

## Resultado esperado

- sem duplicidade lógica de proposta ativa por fornecedor/lote;
- consistência mesmo com chamadas simultâneas;
- ranking atualizado após cada envio/substituição.
