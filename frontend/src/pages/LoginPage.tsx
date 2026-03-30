import { useMutation } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";
import { authService } from "../services/auth.service";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveToken, isAuthenticated } = useAuthToken();
  const [email, setEmail] = useState("admin@lab.local");
  const [password, setPassword] = useState("123456");
  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? "/notices";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      saveToken(data.accessToken);
      navigate(redirectPath, { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="page login-page">
      <section className="card login-card stack">
        <div>
          <h1>Entrar no sistema</h1>
          <p className="muted">
            Use as credenciais seed para acessar o painel.
          </p>
        </div>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="button"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="panel panel-soft">
          <p className="muted">Acesso rápido para teste:</p>
          <p className="muted">ADMIN: admin@lab.local / 123456</p>
          <p className="muted">SUPPLIER: fornecedor1@lab.local / 123456</p>
        </div>

        {loginMutation.isError ? (
          <p className="state-box state-error">
            Falha no login. Verifique credenciais e backend.
          </p>
        ) : null}
      </section>
    </div>
  );
}
