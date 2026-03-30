import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

const TOKEN_STORAGE_KEY = "licitacao_lab_token";

export interface AuthSessionContextValue {
  token: string | null;
  isAuthenticated: boolean;
  saveToken: (value: string) => void;
  clearToken: () => void;
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(
  null,
);

export function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const saveToken = useCallback((value: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, value);
    setToken(value);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      saveToken,
      clearToken,
    }),
    [clearToken, saveToken, token],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
