import { api } from "./api";
import type { Notice, NoticeWithLots } from "../types/api.types";
import { lotsService } from "./lots.service";

export const noticesService = {
  async list(): Promise<Notice[]> {
    const { data } = await api.get<Notice[]>("/notices");
    return data;
  },

  async listWithLots(): Promise<NoticeWithLots[]> {
    const notices = await this.list();

    const noticesWithLots = await Promise.all(
      notices.map(async (notice) => {
        const lots = await lotsService.listByNotice(notice.id);

        return {
          ...notice,
          lots,
        };
      }),
    );

    return noticesWithLots;
  },
};