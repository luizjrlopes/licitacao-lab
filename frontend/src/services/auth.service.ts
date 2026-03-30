import { api } from "./api";
import type { LoginInput, LoginResponse } from "../types/api.types";

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", input);
    return data;
  },
};