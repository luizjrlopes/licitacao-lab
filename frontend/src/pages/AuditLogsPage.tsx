import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { auditService } from "../services/audit.service";
import { usersService } from "../services/users.service";

export function AuditLogsPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: usersService.me,
  });

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditService.list(100),
    enabled: meQuery.data?.role === "ADMIN",
  });

  const actionOptions = useMemo(() => {
    if (!auditLogsQuery.data?.length) {
      return [];
    }

    return Array.from(
      new Set(auditLogsQuery.data.map((log) => log.action)),
    ).sort((a, b) => a.localeCompare(b));
  }, [auditLogsQuery.data]);

  const filteredLogs = useMemo(() => {
    if (!auditLogsQuery.data?.length) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return auditLogsQuery.data.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        log.actorUser.name.toLowerCase().includes(normalizedSearch) ||
        log.actorUser.email.toLowerCase().includes(normalizedSearch) ||
        log.entityType.toLowerCase().includes(normalizedSearch) ||
        log.entityId.toLowerCase().includes(normalizedSearch);

      return matchesAction && matchesSearch;
    });
  }, [actionFilter, auditLogsQuery.data, searchTerm]);

  return (
    <section className="page stack-lg">
      <header className="card page-header-card">
        <h1>Auditoria</h1>
        <p className="muted">
          Últimos eventos críticos do sistema com filtros rápidos para leitura.
        </p>
      </header>

      {meQuery.isLoading ? (
        <p className="state-box state-loading">
          Carregando sessão do usuário...
        </p>
      ) : null}

      {meQuery.isError ? (
        <p className="state-box state-error">
          Não foi possível validar o perfil do usuário.
        </p>
      ) : null}

      {meQuery.data && meQuery.data.role !== "ADMIN" ? (
        <p className="state-box state-empty">
          A visualização de auditoria é permitida apenas para ADMIN.
        </p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.isLoading ? (
        <p className="state-box state-loading">
          Carregando logs de auditoria...
        </p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.isError ? (
        <p className="state-box state-error">
          Não foi possível carregar os logs de auditoria.
        </p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.data?.length ? (
        <>
          <section className="card audit-filters">
            <label className="field">
              <span>Buscar por usuário, entidade ou ID</span>
              <input
                type="text"
                placeholder="Ex.: ADMIN, NOTICE, LOT"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Filtrar por ação</span>
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <option value="ALL">Todas as ações</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {filteredLogs.length ? (
            <div className="table-wrap card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>ID</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                      <td>
                        <div className="stack-xs">
                          <strong>{log.actorUser.name}</strong>
                          <span className="muted text-sm">
                            {log.actorUser.email}
                          </span>
                        </div>
                      </td>
                      <td>{log.action}</td>
                      <td>{log.entityType}</td>
                      <td>{log.entityId}</td>
                      <td>
                        <details>
                          <summary>Ver JSON</summary>
                          <pre className="json-preview">
                            {JSON.stringify(log.metadataJson ?? {}, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="state-box state-empty">
              Nenhum registro encontrado para os filtros atuais.
            </p>
          )}
        </>
      ) : null}

      {meQuery.data?.role === "ADMIN" &&
      !auditLogsQuery.isLoading &&
      !auditLogsQuery.data?.length ? (
        <p className="state-box state-empty">
          Nenhum log de auditoria encontrado.
        </p>
      ) : null}
    </section>
  );
}
