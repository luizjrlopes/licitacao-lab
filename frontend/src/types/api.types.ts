export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export type UserRole = "ADMIN" | "SUPPLIER";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
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
  notice: {
    id: string;
    title: string;
    status: NoticeStatus;
  };
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

export interface CreateBidInput {
  amount: number;
}

export interface CreatedBid {
  id: string;
  lotId: string;
  supplierId: string;
  amount: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadataJson: unknown;
  createdAt: string;
  actorUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
