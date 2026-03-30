import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthToken } from "../hooks/useAuthToken";
import { authService } from "../services/auth.service";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { saveToken } = useAuthToken();
  const [email, setEmail] = useState("admin@lab.local");
  const [password, setPassword] = useState("123456");

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      saveToken(data.accessToken);
      navigate("/notices");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <section className="card stack">
      <h1>Login</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {loginMutation.isError ? (
        <p className="danger">Falha no login. Verifique credenciais e backend.</p>
      ) : null}
    </section>
  );
}