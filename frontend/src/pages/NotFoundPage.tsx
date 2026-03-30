import { Link } from "react-router-dom";

export function NotFoundPage(): JSX.Element {
  return (
    <section className="card stack">
      <h1>Página não encontrada</h1>
      <p className="muted">A rota solicitada não existe.</p>
      <Link to="/">Voltar para início</Link>
    </section>
  );
}