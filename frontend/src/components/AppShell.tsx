import { Link, Outlet } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";

export function AppShell(): JSX.Element {
  const { token, clearToken } = useAuthToken();

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>licitacao-lab</strong>
        <nav className="app-nav">
          <Link to="/">Início</Link>
          <Link to="/login">Login</Link>
          <Link to="/notices">Editais</Link>
          <Link to="/lots/1">Lote #1</Link>
          {token ? <button onClick={clearToken}>Sair</button> : null}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}