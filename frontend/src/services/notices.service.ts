import { api } from "./api";
import type { Notice } from "../types/api.types";

export const noticesService = {
  async list(): Promise<Notice[]> {
    const { data } = await api.get<Notice[]>("/notices");
    return data;
  },
};