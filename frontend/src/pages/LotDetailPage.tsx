import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { bidsService } from "../services/bids.service";
import { lotsService } from "../services/lots.service";
import { usersService } from "../services/users.service";

type BidFormValues = {
  amount: number;
};

export function LotDetailPage(): JSX.Element {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const lotId = id ?? "";
  const isValidLotId = Boolean(lotId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BidFormValues>({
    defaultValues: {
      amount: undefined,
    },
  });

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
      reset();
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

  const onSubmitBid = (data: BidFormValues) => {
    createBidMutation.mutate(data.amount);
  };

  if (!isValidLotId) {
    return (
      <section className="state-box state-error">ID de lote inválido.</section>
    );
  }

  return (
    <div className="page stack-lg">
      <section className="card page-header-card">
        <h1>Detalhe do lote #{lotId}</h1>
      </section>

      {lotQuery.isLoading ? (
        <section className="state-box state-loading">
          Carregando lote...
        </section>
      ) : null}

      {lotQuery.isError ? (
        <section className="state-box state-error">
          Não foi possível carregar os dados do lote.
        </section>
      ) : null}

      <section className="lot-layout">
        <article className="card stack">
          <h2>Informações principais</h2>

          {lotQuery.data ? (
            <div className="info-grid">
              <div className="panel panel-soft">
                <p className="muted">Código</p>
                <strong>{lotQuery.data.code}</strong>
              </div>

              <div className="panel panel-soft">
                <p className="muted">Valor de referência</p>
                <strong>
                  {Number(lotQuery.data.referenceValue).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    },
                  )}
                </strong>
              </div>

              <div className="panel panel-soft">
                <p className="muted">Edital</p>
                <strong>{lotQuery.data.notice.title}</strong>
              </div>

              <div className="panel panel-soft">
                <p className="muted">Status do edital</p>
                <span
                  className={
                    lotQuery.data.notice.status === "OPEN"
                      ? "status-pill status-pill-open"
                      : lotQuery.data.notice.status === "CLOSED"
                        ? "status-pill status-pill-closed"
                        : "status-pill status-pill-draft"
                  }
                >
                  {lotQuery.data.notice.status}
                </span>
              </div>
            </div>
          ) : null}

          {lotQuery.data ? <p>{lotQuery.data.description}</p> : null}
        </article>

        <article className="card stack">
          <h2>Enviar proposta</h2>

          {meQuery.isLoading ? (
            <p className="state-box state-loading">
              Carregando sessão do usuário...
            </p>
          ) : null}

          {meQuery.isError ? (
            <p className="state-box state-error">
              Não foi possível carregar os dados do usuário autenticado.
            </p>
          ) : null}

          {meQuery.data && meQuery.data.role !== "SUPPLIER" ? (
            <p className="state-box state-empty">
              Apenas usuários SUPPLIER podem enviar proposta.
            </p>
          ) : null}

          {meQuery.data &&
          lotQuery.data &&
          lotQuery.data.notice.status !== "OPEN" ? (
            <p className="state-box state-empty">
              Propostas só podem ser enviadas quando o edital estiver OPEN.
            </p>
          ) : null}

          <form className="stack" onSubmit={handleSubmit(onSubmitBid)}>
            <label className="field">
              <span>Valor da proposta</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex.: 9500.00"
                {...register("amount", {
                  required: "Informe o valor da proposta",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "O valor deve ser maior que zero",
                  },
                })}
              />
            </label>

            {errors.amount ? (
              <p className="state-box state-error">{errors.amount.message}</p>
            ) : null}

            <button
              type="submit"
              className="button"
              disabled={!canSubmitBid || createBidMutation.isPending}
            >
              {createBidMutation.isPending
                ? "Enviando proposta..."
                : "Enviar proposta"}
            </button>
          </form>

          {createBidMutation.isError ? (
            <p className="state-box state-error">
              Falha ao enviar proposta. Verifique as regras e tente novamente.
            </p>
          ) : null}

          {createBidMutation.isSuccess ? (
            <p className="state-box state-success">
              Proposta enviada com sucesso.
            </p>
          ) : null}
        </article>
      </section>

      <section className="card stack">
        <h2>Ranking</h2>

        {rankingQuery.isLoading ? (
          <p className="state-box state-loading">Carregando ranking...</p>
        ) : null}

        {rankingQuery.isError ? (
          <p className="state-box state-error">
            Não foi possível carregar o ranking.
          </p>
        ) : null}

        {rankingQuery.data?.ranking.length ? (
          <div className="table-wrap">
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
                    <td>
                      {Number(bid.amount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td>{new Date(bid.submittedAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!rankingQuery.isLoading && !rankingQuery.data?.ranking.length ? (
          <p className="state-box state-empty">Sem propostas para este lote.</p>
        ) : null}
      </section>
    </div>
  );
}
