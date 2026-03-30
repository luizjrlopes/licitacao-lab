import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NoticeStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ListNoticesQueryDto } from "./dto/list-notices-query.dto";

@Injectable()
export class NoticesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private readonly noticeSelect = {
    id: true,
    title: true,
    description: true,
    status: true,
    publishedAt: true,
    closedAt: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(
    actorUserId: string,
    createNoticeDto: CreateNoticeDto,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const notice = await this.prismaService.notice.create({
      data: {
        title: createNoticeDto.title,
        description: createNoticeDto.description,
        status: NoticeStatus.DRAFT,
      },
      select: this.noticeSelect,
    });

    await this.auditService.logAction({
      actorUserId,
      action: "NOTICE_CREATE",
      entityType: "NOTICE",
      entityId: notice.id,
      metadataJson: {
        title: notice.title,
        status: notice.status,
      },
    });

    return notice;
  }

  list(query: ListNoticesQueryDto): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      status: NoticeStatus;
      publishedAt: Date | null;
      closedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    return this.prismaService.notice.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: "desc" },
      select: this.noticeSelect,
    });
  }

  async detail(id: string): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const notice = await this.prismaService.notice.findUnique({
      where: { id },
      select: this.noticeSelect,
    });

    if (!notice) {
      throw new NotFoundException("Edital não encontrado");
    }

    return notice;
  }

  async publish(
    actorUserId: string,
    id: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const notice = await this.prismaService.notice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!notice) {
      throw new NotFoundException("Edital não encontrado");
    }

    if (notice.status !== NoticeStatus.DRAFT) {
      throw new BadRequestException(
        "Somente edital em DRAFT pode ser publicado",
      );
    }

    const updated = await this.prismaService.notice.update({
      where: { id },
      data: {
        status: NoticeStatus.OPEN,
        publishedAt: new Date(),
        closedAt: null,
      },
      select: this.noticeSelect,
    });

    await this.auditService.logAction({
      actorUserId,
      action: "NOTICE_PUBLISH",
      entityType: "NOTICE",
      entityId: updated.id,
      metadataJson: {
        status: updated.status,
      },
    });

    return updated;
  }

  async close(
    actorUserId: string,
    id: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const notice = await this.prismaService.notice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!notice) {
      throw new NotFoundException("Edital não encontrado");
    }

    if (notice.status !== NoticeStatus.OPEN) {
      throw new BadRequestException(
        "Somente edital em OPEN pode ser encerrado",
      );
    }

    const updated = await this.prismaService.notice.update({
      where: { id },
      data: {
        status: NoticeStatus.CLOSED,
        closedAt: new Date(),
      },
      select: this.noticeSelect,
    });

    await this.auditService.logAction({
      actorUserId,
      action: "NOTICE_CLOSE",
      entityType: "NOTICE",
      entityId: updated.id,
      metadataJson: {
        status: updated.status,
      },
    });

    return updated;
  }
}
