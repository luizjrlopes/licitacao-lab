# AUTENTICACAO_E_AUTORIZACAO

## Visão geral

A aplicação usa autenticação baseada em JWT e autorização por perfil (`ADMIN` e `SUPPLIER`).

## Autenticação

### Login

Endpoint:

- `POST /auth/login`

Entrada:

- `email`
- `password`

Fluxo no backend (`AuthService`):

1. Busca usuário por e-mail;
2. Compara senha com `passwordHash` usando `bcryptjs.compareSync`;
3. Em caso de sucesso, gera token JWT com payload:
   - `sub` (id do usuário)
   - `email`
   - `role`
   - `name`
4. Registra auditoria de `LOGIN`.

Saída:

- `accessToken`
- objeto `user` (id, nome, e-mail, role)

### Validação do token

- `JwtStrategy` lê token do header `Authorization: Bearer <token>`;
- `JwtAuthGuard` aplica a estratégia `jwt` nas rotas protegidas.

## Autorização por perfil

### Como funciona

- Decorator `@Roles(...)` marca os perfis permitidos;
- `RolesGuard` valida `request.user.role` contra os perfis exigidos;
- sem usuário autenticado → `401`;
- perfil sem permissão → `403`.

### Mapeamento principal de permissões

#### ADMIN

- criar/publicar/encerrar edital
- criar lotes
- listar usuários
- visualizar auditoria
- também pode consultar editais/lotes/ranking

#### SUPPLIER

- consultar editais/lotes/ranking
- enviar proposta
- listar suas propostas (`/me/bids`)

## Aplicação dos guards no código atual

A ordem usada nas rotas protegidas é:

- `@UseGuards(JwtAuthGuard, RolesGuard)`

Essa ordem garante que a autenticação ocorra antes da validação de perfil.

## Frontend e sessão

- token armazenado em `localStorage` (`licitacao_lab_token`);
- interceptor do Axios adiciona automaticamente o header Authorization;
- componente `AuthenticatedRoute` bloqueia navegação sem token.

## Endpoints-chave relacionados

- `POST /auth/login`
- `GET /users/me`
- `GET /users` (ADMIN)
- `GET /audit-logs` (ADMIN)
- `POST /lots/:lotId/bids` (SUPPLIER)
- `GET /me/bids` (SUPPLIER)
