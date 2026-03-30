import { Link, Outlet } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";

export function AppShell(): JSX.Element {
  const { isAuthenticated, clearToken } = useAuthToken();

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>licitacao-lab</strong>
        <nav className="app-nav">
          <Link to="/">Início</Link>
          {!isAuthenticated ? <Link to="/login">Login</Link> : null}
          <Link to="/notices">Editais</Link>
          <Link to="/lots/1">Lote #1</Link>
          {isAuthenticated ? <button onClick={clearToken}>Sair</button> : null}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
