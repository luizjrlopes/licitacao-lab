import { api } from "./api";
import type { Lot, LotRankingResponse } from "../types/api.types";

export const lotsService = {
  async listByNotice(noticeId: string): Promise<Lot[]> {
    const { data } = await api.get<Lot[]>(`/notices/${noticeId}/lots`);
    return data;
  },

  async getById(id: string): Promise<Lot> {
    const { data } = await api.get<Lot>(`/lots/${id}`);
    return data;
  },

  async getRanking(id: string): Promise<LotRankingResponse> {
    const { data } = await api.get<LotRankingResponse>(`/lots/${id}/ranking`);
    return data;
  },
};