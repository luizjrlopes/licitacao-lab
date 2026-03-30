export function HomePage(): JSX.Element {
  return (
    <section className="card stack">
      <h1>Frontend base pronto</h1>
      <p className="muted">
        Esta etapa prepara a estrutura do React com rotas, Axios e TanStack Query.
      </p>
      <ul>
        <li>Use a tela de login para autenticar.</li>
        <li>Use a tela de editais para testar chamadas com Query.</li>
        <li>Use /lots/:id para ver detalhe e ranking de um lote.</li>
      </ul>
    </section>
  );
}