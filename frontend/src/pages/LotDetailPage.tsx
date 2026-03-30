import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { lotsService } from "../services/lots.service";

export function LotDetailPage(): JSX.Element {
  const { id } = useParams();
  const lotId = id ?? "";
  const isValidLotId = Boolean(lotId);

  const lotQuery = useQuery({
    queryKey: ["lot", lotId],
    queryFn: () => lotsService.getById(lotId),
    enabled: isValidLotId,
  });

  const rankingQuery = useQuery({
    queryKey: ["lot-ranking", lotId],
    queryFn: () => lotsService.getRanking(lotId),
    enabled: isValidLotId,
  });

  if (!isValidLotId) {
    return (
      <section className="card">
        <p className="danger">ID de lote inválido.</p>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="card stack">
        <h1>Detalhe do lote #{lotId}</h1>

        {lotQuery.isLoading ? <p>Carregando lote...</p> : null}
        {lotQuery.isError ? (
          <p className="danger">Não foi possível carregar os dados do lote.</p>
        ) : null}

        {lotQuery.data ? (
          <>
            <p>
              <strong>Código:</strong> {lotQuery.data.code}
            </p>
            <p>
              <strong>Descrição:</strong> {lotQuery.data.description}
            </p>
            <p>
              <strong>Valor de referência:</strong> {lotQuery.data.referenceValue}
            </p>
          </>
        ) : null}
      </section>

      <section className="card stack">
        <h2>Ranking</h2>

        {rankingQuery.isLoading ? <p>Carregando ranking...</p> : null}
        {rankingQuery.isError ? (
          <p className="danger">Não foi possível carregar o ranking.</p>
        ) : null}

        {rankingQuery.data?.ranking.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {rankingQuery.data.ranking.map((bid) => (
                <tr key={bid.bidId}>
                  <td>{bid.position}</td>
                  <td>{bid.supplierName}</td>
                  <td>{bid.amount}</td>
                  <td>{new Date(bid.submittedAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {!rankingQuery.isLoading && !rankingQuery.data?.ranking.length ? (
          <p className="muted">Sem propostas para este lote.</p>
        ) : null}
      </section>
    </div>
  );
}