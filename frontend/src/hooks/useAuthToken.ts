import { useCallback, useState } from "react";

const TOKEN_STORAGE_KEY = "licitacao_lab_token";

export function useAuthToken(): {
  token: string | null;
  saveToken: (value: string) => void;
  clearToken: () => void;
} {
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

  return {
    token,
    saveToken,
    clearToken,
  };
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}