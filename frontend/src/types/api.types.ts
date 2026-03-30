export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export type NoticeStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface Notice {
  id: string;
  title: string;
  description: string;
  status: NoticeStatus;
}

export interface Lot {
  id: string;
  noticeId: string;
  code: string;
  description: string;
  referenceValue: string;
}

export interface RankingBid {
  position: number;
  bidId: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  submittedAt: string;
}

export interface LotRankingResponse {
  lotId: string;
  ranking: RankingBid[];
}

export interface NoticeWithLots extends Notice {
  lots: Lot[];
}