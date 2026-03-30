import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { bidsService } from "../services/bids.service";
import { lotsService } from "../services/lots.service";
import { usersService } from "../services/users.service";

export function LotDetailPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const lotId = id ?? "";
  const isValidLotId = Boolean(lotId);
  const [amountInput, setAmountInput] = useState("");

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

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: usersService.me,
    enabled: isValidLotId,
  });

  const createBidMutation = useMutation({
    mutationFn: async (amount: number) => bidsService.create(lotId, { amount }),
    onSuccess: async () => {
      setAmountInput("");
      await queryClient.invalidateQueries({ queryKey: ["lot-ranking", lotId] });
    },
  });

  const canSubmitBid = useMemo(() => {
    if (!meQuery.data || !lotQuery.data) {
      return false;
    }

    return (
      meQuery.data.role === "SUPPLIER" && lotQuery.data.notice.status === "OPEN"
    );
  }, [lotQuery.data, meQuery.data]);

  const handleSubmitBid = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amountInput.replace(",", "."));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    createBidMutation.mutate(parsedAmount);
  };

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
              <strong>Valor de referência:</strong>{" "}
              {lotQuery.data.referenceValue}
            </p>
            <p>
              <strong>Edital:</strong> {lotQuery.data.notice.title} (
              {lotQuery.data.notice.status})
            </p>
          </>
        ) : null}
      </section>

      <section className="card stack">
        <h2>Enviar proposta</h2>

        {meQuery.isLoading ? <p>Carregando sessão do usuário...</p> : null}

        {meQuery.isError ? (
          <p className="danger">
            Não foi possível carregar os dados do usuário autenticado.
          </p>
        ) : null}

        {meQuery.data && meQuery.data.role !== "SUPPLIER" ? (
          <p className="muted">
            Apenas usuários SUPPLIER podem enviar proposta.
          </p>
        ) : null}

        {meQuery.data &&
        lotQuery.data &&
        lotQuery.data.notice.status !== "OPEN" ? (
          <p className="muted">
            Propostas só podem ser enviadas quando o edital estiver OPEN.
          </p>
        ) : null}

        <form className="stack" onSubmit={handleSubmitBid}>
          <label>
            Valor da proposta
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="Ex.: 9500.00"
              required
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmitBid || createBidMutation.isPending}
          >
            {createBidMutation.isPending
              ? "Enviando proposta..."
              : "Enviar proposta"}
          </button>
        </form>

        {createBidMutation.isError ? (
          <p className="danger">
            Falha ao enviar proposta. Verifique as regras e tente novamente.
          </p>
        ) : null}

        {createBidMutation.isSuccess ? (
          <p className="muted">Proposta enviada com sucesso.</p>
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
