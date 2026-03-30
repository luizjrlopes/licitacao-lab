# FRONTEND

## Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form

## Estrutura principal

```txt
frontend/src/
  components/
  contexts/
  hooks/
  pages/
  routes/
  services/
  types/
```

## Roteamento

Arquivo: `src/routes/app-router.tsx`

Rotas principais:

- `/` → Home
- `/login` → Login
- `/notices` → listagem de editais/lotes (protegida)
- `/lots/:id` → detalhe de lote + proposta + ranking (protegida)
- `/audit-logs` → visualização de auditoria (protegida)
- `*` → NotFound

Proteção de rota:

- Componente `AuthenticatedRoute` redireciona para `/login` quando não há token.

## Sessão e token

Arquivo: `src/contexts/auth-session.context.tsx`

- token JWT é salvo em `localStorage` (`licitacao_lab_token`);
- estado de sessão é disponibilizado via contexto (`isAuthenticated`, `saveToken`, `clearToken`);
- token é injetado automaticamente no Axios por interceptor (`services/api.ts`).

## Serviços de API

- `auth.service.ts` → login (`POST /auth/login`)
- `users.service.ts` → usuário autenticado (`GET /users/me`)
- `notices.service.ts` → editais (`GET /notices`) e composição com lotes
- `lots.service.ts` → lotes e ranking
- `bids.service.ts` → envio de proposta
- `audit.service.ts` → logs de auditoria

## Páginas principais

### LoginPage

- formulário simples de e-mail/senha;
- realiza login com mutation;
- salva token e redireciona para rota de origem ou `/notices`.

### NoticesPage

- carrega editais e lotes associados;
- exibe estados de loading/erro/vazio;
- fornece navegação para detalhe de lote.

### LotDetailPage

- busca detalhe do lote;
- busca ranking do lote;
- busca usuário autenticado para habilitar regra de envio;
- formulário com React Hook Form para enviar proposta;
- invalida query do ranking após sucesso.

Regras de UI (não substituem backend):

- apenas SUPPLIER envia proposta;
- proposta apenas se edital estiver OPEN.

### AuditLogsPage

- valida perfil via `/users/me`;
- apenas ADMIN consulta `GET /audit-logs`;
- exibe tabela com payload JSON do log.

## Tipos compartilhados

Arquivo: `src/types/api.types.ts`

Define contratos usados no frontend, incluindo:

- usuário autenticado (`AuthenticatedUser`)
- edital (`Notice`)
- lote (`Lot`)
- ranking (`LotRankingResponse`)
- proposta criada (`CreatedBid`)
- auditoria (`AuditLogItem`)

## Configuração de API

Arquivo: `src/services/api.ts`

- baseURL via `VITE_API_URL` (fallback `http://localhost:3000`);
- interceptor adiciona header `Authorization` quando há token.
