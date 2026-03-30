import { NavLink, Outlet } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";

export function AppShell(): JSX.Element {
  const { isAuthenticated, clearToken } = useAuthToken();

  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <p className="brand-title">licitacao-lab</p>
          <p className="brand-subtitle">Painel administrativo de licitações</p>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <span className="status-pill status-pill-neutral">
              Sessão ativa
            </span>
          ) : (
            <span className="status-pill status-pill-neutral">
              Sessão anônima
            </span>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={clearToken}
            >
              Sair
            </button>
          ) : null}
        </div>
      </header>

      <nav className="app-nav" aria-label="Navegação principal">
        <NavLink to="/" end className={getNavLinkClassName}>
          Home
        </NavLink>

        {!isAuthenticated ? (
          <NavLink to="/login" className={getNavLinkClassName}>
            Login
          </NavLink>
        ) : null}

        <NavLink to="/notices" className={getNavLinkClassName}>
          Editais
        </NavLink>

        <NavLink to="/audit-logs" className={getNavLinkClassName}>
          Auditoria
        </NavLink>
      </nav>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
