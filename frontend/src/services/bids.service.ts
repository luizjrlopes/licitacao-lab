import type { CreateBidInput, CreatedBid } from "../types/api.types";
import { api } from "./api";

export const bidsService = {
  async create(lotId: string, input: CreateBidInput): Promise<CreatedBid> {
    const { data } = await api.post<CreatedBid>(`/lots/${lotId}/bids`, input);
    return data;
  },
};
