import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { noticesService } from "../services/notices.service";

export function NoticesPage(): JSX.Element {
  const noticesQuery = useQuery({
    queryKey: ["notices", "lots"],
    queryFn: noticesService.listWithLots,
  });

  return (
    <div className="stack">
      <section className="card stack">
        <h1>Editais e lotes</h1>
        <p className="muted">
          Esta listagem é somente de leitura. As regras críticas continuam validadas no backend.
        </p>
      </section>

      {noticesQuery.isLoading ? (
        <section className="card">
          <p>Carregando editais e lotes...</p>
        </section>
      ) : null}

      {noticesQuery.isError ? (
        <section className="card">
          <p className="danger">Não foi possível carregar editais e lotes.</p>
        </section>
      ) : null}

      {!noticesQuery.isLoading && !noticesQuery.data?.length ? (
        <section className="card">
          <p className="muted">Nenhum edital encontrado.</p>
        </section>
      ) : null}

      {noticesQuery.data?.map((notice) => (
        <section key={notice.id} className="card stack">
          <div>
            <h2>{notice.title}</h2>
            <p className="muted">Status: {notice.status}</p>
            <p>{notice.description}</p>
          </div>

          <div>
            <h3>Lotes do edital</h3>

            {notice.lots.length === 0 ? (
              <p className="muted">Este edital ainda não possui lotes.</p>
            ) : (
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
                      <td>{lot.referenceValue}</td>
                      <td>
                        <Link to={`/lots/${lot.id}`}>Ver detalhe</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}