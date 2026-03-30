import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { noticesService } from "../services/notices.service";

function getStatusLabel(status: string): string {
  if (status === "OPEN") return "Aberto";
  if (status === "CLOSED") return "Encerrado";
  return "Rascunho";
}

function getStatusClassName(status: string): string {
  if (status === "OPEN") return "status-pill status-pill-open";
  if (status === "CLOSED") return "status-pill status-pill-closed";
  return "status-pill status-pill-draft";
}

export function NoticesPage(): JSX.Element {
  const noticesQuery = useQuery({
    queryKey: ["notices", "lots"],
    queryFn: noticesService.listWithLots,
  });

  return (
    <div className="page stack-lg">
      <section className="card page-header-card">
        <h1>Editais e lotes</h1>
        <p className="muted">
          Esta listagem é somente de leitura. As regras críticas continuam
          validadas no backend.
        </p>
      </section>

      {noticesQuery.isLoading ? (
        <section className="state-box state-loading">
          Carregando editais e lotes...
        </section>
      ) : null}

      {noticesQuery.isError ? (
        <section className="state-box state-error">
          Não foi possível carregar editais e lotes.
        </section>
      ) : null}

      {!noticesQuery.isLoading && !noticesQuery.data?.length ? (
        <section className="state-box state-empty">
          Nenhum edital encontrado.
        </section>
      ) : null}

      {noticesQuery.data?.map((notice) => (
        <section key={notice.id} className="card notice-card stack">
          <div className="notice-card-header">
            <div>
              <h2>{notice.title}</h2>
              <p className="muted">ID: {notice.id}</p>
            </div>
            <span className={getStatusClassName(notice.status)}>
              {getStatusLabel(notice.status)}
            </span>
          </div>

          <p>{notice.description}</p>

          <div className="panel panel-soft stack">
            <p className="muted">Lotes vinculados: {notice.lots.length}</p>
          </div>

          <div>
            <h3>Lotes do edital</h3>

            {notice.lots.length === 0 ? (
              <p className="state-box state-empty">
                Este edital ainda não possui lotes.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th>Valor de referência</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notice.lots.map((lot) => (
                      <tr key={lot.id}>
                        <td>{lot.code}</td>
                        <td>{lot.description}</td>
                        <td>
                          {Number(lot.referenceValue).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td>
                          <Link
                            to={`/lots/${lot.id}`}
                            className="button-link button-link-sm"
                          >
                            Ver lote
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
