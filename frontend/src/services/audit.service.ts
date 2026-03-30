import type { AuditLogItem } from "../types/api.types";
import { api } from "./api";

export const auditService = {
  async list(limit = 100): Promise<AuditLogItem[]> {
    const { data } = await api.get<AuditLogItem[]>("/audit-logs", {
      params: { limit },
    });
    return data;
  },
};
