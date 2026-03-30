import { api } from "./api";
import type { Lot, RankingBid } from "../types/api.types";

export const lotsService = {
  async getById(id: number): Promise<Lot> {
    const { data } = await api.get<Lot>(`/lots/${id}`);
    return data;
  },

  async getRanking(id: number): Promise<RankingBid[]> {
    const { data } = await api.get<RankingBid[]>(`/lots/${id}/ranking`);
    return data;
  },
};