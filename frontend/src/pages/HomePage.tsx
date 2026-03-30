import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";
import { noticesService } from "../services/notices.service";
import { usersService } from "../services/users.service";

export function HomePage(): JSX.Element {
  const { isAuthenticated } = useAuthToken();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: usersService.me,
    enabled: isAuthenticated,
  });

  const noticesQuery = useQuery({
    queryKey: ["notices", "dashboard"],
    queryFn: noticesService.listWithLots,
    enabled: isAuthenticated,
  });

  const totalNotices = noticesQuery.data?.length ?? 0;
  const openNotices =
    noticesQuery.data?.filter((notice) => notice.status === "OPEN").length ?? 0;
  const totalLots =
    noticesQuery.data?.reduce((acc, notice) => acc + notice.lots.length, 0) ??
    0;

  return (
    <div className="page stack-lg">
      <section className="card page-header-card">
        <h1>Dashboard</h1>
        <p className="muted">
          Visão rápida do ambiente de estudo para apoiar demonstração técnica.
        </p>
      </section>

      {!isAuthenticated ? (
        <section className="card stack">
          <h2>Acesso ao sistema</h2>
          <p className="muted">
            Faça login para visualizar os editais, lotes, ranking e trilha de
            auditoria.
          </p>
          <div className="credential-grid">
            <article className="panel">
              <h3>ADMIN</h3>
              <p className="muted">admin@lab.local</p>
              <p className="muted">Senha: 123456</p>
            </article>
            <article className="panel">
              <h3>SUPPLIER</h3>
              <p className="muted">fornecedor1@lab.local</p>
              <p className="muted">Senha: 123456</p>
            </article>
          </div>
          <Link to="/login" className="button-link">
            Ir para login
          </Link>
        </section>
      ) : null}

      {isAuthenticated ? (
        <>
          {meQuery.isLoading || noticesQuery.isLoading ? (
            <section className="state-box state-loading">
              Carregando resumo da dashboard...
            </section>
          ) : null}

          {meQuery.isError || noticesQuery.isError ? (
            <section className="state-box state-error">
              Não foi possível carregar os dados da dashboard.
            </section>
          ) : null}

          {!meQuery.isLoading &&
          !noticesQuery.isLoading &&
          !meQuery.isError &&
          !noticesQuery.isError ? (
            <section className="dashboard-grid">
              <article className="kpi-card">
                <span className="kpi-label">Perfil atual</span>
                <strong className="kpi-value">{meQuery.data?.role}</strong>
                <p className="muted">{meQuery.data?.name}</p>
              </article>

              <article className="kpi-card">
                <span className="kpi-label">Editais totais</span>
                <strong className="kpi-value">{totalNotices}</strong>
                <p className="muted">DRAFT, OPEN e CLOSED</p>
              </article>

              <article className="kpi-card">
                <span className="kpi-label">Editais abertos</span>
                <strong className="kpi-value">{openNotices}</strong>
                <p className="muted">Disponíveis para disputa</p>
              </article>

              <article className="kpi-card">
                <span className="kpi-label">Lotes mapeados</span>
                <strong className="kpi-value">{totalLots}</strong>
                <p className="muted">Somatório dos editais listados</p>
              </article>
            </section>
          ) : null}

          <section className="card stack">
            <h2>Atalhos</h2>
            <div className="quick-links">
              <Link to="/notices" className="button-link">
                Ver editais e lotes
              </Link>
              <Link to="/audit-logs" className="button-link button-link-ghost">
                Abrir auditoria
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
