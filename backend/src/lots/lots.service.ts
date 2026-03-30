import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NoticeStatus, Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { CreateLotDto } from "./dto/create-lot.dto";

@Injectable()
export class LotsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  private readonly lotSelect = {
    id: true,
    noticeId: true,
    code: true,
    description: true,
    referenceValue: true,
    createdAt: true,
    updatedAt: true,
    notice: {
      select: {
        id: true,
        title: true,
        status: true,
      },
    },
  };

  async create(
    actorUserId: string,
    noticeId: string,
    createLotDto: CreateLotDto,
  ): Promise<{
    id: string;
    noticeId: string;
    code: string;
    description: string;
    referenceValue: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    notice: {
      id: string;
      title: string;
      status: NoticeStatus;
    };
  }> {
    const notice = await this.prismaService.notice.findUnique({
      where: { id: noticeId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!notice) {
      throw new NotFoundException("Edital não encontrado");
    }

    if (notice.status === NoticeStatus.CLOSED) {
      throw new BadRequestException(
        "Não é permitido criar lote em edital encerrado",
      );
    }

    try {
      const lot = await this.prismaService.lot.create({
        data: {
          noticeId,
          code: createLotDto.code,
          description: createLotDto.description,
          referenceValue: new Prisma.Decimal(createLotDto.referenceValue),
        },
        select: this.lotSelect,
      });

      await this.auditService.logAction({
        actorUserId,
        action: "LOT_CREATE",
        entityType: "LOT",
        entityId: lot.id,
        metadataJson: {
          noticeId: lot.noticeId,
          code: lot.code,
          referenceValue: Number(lot.referenceValue),
        },
      });

      return lot;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Já existe lote com este código para o edital informado",
        );
      }

      throw error;
    }
  }

  async detail(id: string): Promise<{
    id: string;
    noticeId: string;
    code: string;
    description: string;
    referenceValue: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    notice: {
      id: string;
      title: string;
      status: NoticeStatus;
    };
  }> {
    const lot = await this.prismaService.lot.findUnique({
      where: { id },
      select: this.lotSelect,
    });

    if (!lot) {
      throw new NotFoundException("Lote não encontrado");
    }

    return lot;
  }

  async getRanking(id: string): Promise<{
    lotId: string;
    ranking: Array<{
      position: number;
      bidId: string;
      supplierId: string;
      supplierName: string;
      amount: number;
      submittedAt: string;
    }>;
  }> {
    const cacheKey = `ranking:lot:${id}`;
    const cached = await this.redisService.getJson<{
      lotId: string;
      ranking: Array<{
        position: number;
        bidId: string;
        supplierId: string;
        supplierName: string;
        amount: number;
        submittedAt: string;
      }>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const lot = await this.prismaService.lot.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lot) {
      throw new NotFoundException("Lote não encontrado");
    }

    const bids = await this.prismaService.bid.findMany({
      where: {
        lotId: id,
        isActive: true,
      },
      orderBy: [{ amount: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        supplierId: true,
        amount: true,
        createdAt: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    const response = {
      lotId: id,
      ranking: bids.map((bid, index) => ({
        position: index + 1,
        bidId: bid.id,
        supplierId: bid.supplierId,
        supplierName: bid.supplier.name,
        amount: Number(bid.amount),
        submittedAt: bid.createdAt.toISOString(),
      })),
    };

    await this.redisService.setJson(cacheKey, response, 30);

    return response;
  }
}
