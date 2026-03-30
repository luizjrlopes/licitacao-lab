import type { AuthenticatedUser } from "../types/api.types";
import { api } from "./api";

export const usersService = {
  async me(): Promise<AuthenticatedUser> {
    const { data } = await api.get<AuthenticatedUser>("/users/me");
    return data;
  },
};