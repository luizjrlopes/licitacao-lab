export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface Notice {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "OPEN" | "CLOSED";
}

export interface Lot {
  id: number;
  noticeId: number;
  code: string;
  description: string;
  referenceValue: string;
}

export interface RankingBid {
  id: number;
  supplierId: number;
  amount: string;
  createdAt: string;
}