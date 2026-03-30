import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/audit.service";
import { usersService } from "../services/users.service";

export function AuditLogsPage(): JSX.Element {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: usersService.me,
  });

  const auditLogsQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditService.list(100),
    enabled: meQuery.data?.role === "ADMIN",
  });

  return (
    <section className="card stack">
      <h1>Auditoria</h1>

      {meQuery.isLoading ? <p>Carregando sessão do usuário...</p> : null}

      {meQuery.isError ? (
        <p className="danger">Não foi possível validar o perfil do usuário.</p>
      ) : null}

      {meQuery.data && meQuery.data.role !== "ADMIN" ? (
        <p className="muted">
          A visualização de auditoria é permitida apenas para ADMIN.
        </p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.isLoading ? (
        <p>Carregando logs de auditoria...</p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.isError ? (
        <p className="danger">
          Não foi possível carregar os logs de auditoria.
        </p>
      ) : null}

      {meQuery.data?.role === "ADMIN" && auditLogsQuery.data?.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {auditLogsQuery.data.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                <td>{log.actorUser.name}</td>
                <td>{log.action}</td>
                <td>
                  {log.entityType} ({log.entityId})
                </td>
                <td>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(log.metadataJson ?? {}, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {meQuery.data?.role === "ADMIN" &&
      !auditLogsQuery.isLoading &&
      !auditLogsQuery.data?.length ? (
        <p className="muted">Nenhum log de auditoria encontrado.</p>
      ) : null}
    </section>
  );
}
