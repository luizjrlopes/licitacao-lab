import { useContext } from "react";
import { AuthSessionContext } from "../contexts/auth-session.context";

export function useAuthToken(): {
  token: string | null;
  isAuthenticated: boolean;
  saveToken: (value: string) => void;
  clearToken: () => void;
} {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthToken deve ser usado dentro de AuthSessionProvider",
    );
  }

  return context;
}
