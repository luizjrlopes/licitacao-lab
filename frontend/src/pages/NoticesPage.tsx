import { useQuery } from "@tanstack/react-query";
import { noticesService } from "../services/notices.service";

export function NoticesPage(): JSX.Element {
  const noticesQuery = useQuery({
    queryKey: ["notices"],
    queryFn: noticesService.list,
  });

  return (
    <section className="card stack">
      <h1>Editais</h1>

      {noticesQuery.isLoading ? <p>Carregando editais...</p> : null}

      {noticesQuery.isError ? (
        <p className="danger">Não foi possível carregar os editais.</p>
      ) : null}

      {noticesQuery.data?.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {noticesQuery.data.map((notice) => (
              <tr key={notice.id}>
                <td>{notice.id}</td>
                <td>{notice.title}</td>
                <td>{notice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {!noticesQuery.isLoading && !noticesQuery.data?.length ? (
        <p className="muted">Nenhum edital encontrado.</p>
      ) : null}
    </section>
  );
}