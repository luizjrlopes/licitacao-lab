import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NoticeStatus, Prisma, UserRole } from "@prisma/client";
import { JwtUser } from "../auth/types/jwt-user.type";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { CreateBidDto } from "./dto/create-bid.dto";

@Injectable()
export class BidsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    lotId: string,
    actor: JwtUser,
    createBidDto: CreateBidDto,
  ): Promise<{
    id: string;
    lotId: string;
    supplierId: string;
    amount: Prisma.Decimal;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    if (actor.role !== UserRole.SUPPLIER) {
      throw new BadRequestException("Somente fornecedor pode enviar proposta");
    }

    const lot = await this.prismaService.lot.findUnique({
      where: { id: lotId },
      select: {
        id: true,
        notice: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException("Lote não encontrado");
    }

    if (lot.notice.status !== NoticeStatus.OPEN) {
      throw new BadRequestException(
        "Só é permitido enviar proposta em edital OPEN",
      );
    }

    const lockKey = `${lotId}:${actor.sub}`;

    try {
      const createdBid = await this.prismaService.$transaction(
        async (tx) => {
          await tx.$executeRaw`
            SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)
          `;

          const updated = await tx.bid.updateMany({
            where: {
              lotId,
              supplierId: actor.sub,
              isActive: true,
            },
            data: {
              isActive: false,
            },
          });

          const bid = await tx.bid.create({
            data: {
              lotId,
              supplierId: actor.sub,
              amount: new Prisma.Decimal(createBidDto.amount),
              isActive: true,
            },
            select: {
              id: true,
              lotId: true,
              supplierId: true,
              amount: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          await this.auditService.logAction(
            {
              actorUserId: actor.sub,
              action: updated.count > 0 ? "BID_REPLACE" : "BID_CREATE",
              entityType: "BID",
              entityId: bid.id,
              metadataJson: {
                lotId,
                supplierId: actor.sub,
                amount: Number(bid.amount),
                replacedPrevious: updated.count > 0,
              },
            },
            tx,
          );

          return bid;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      await this.redisService.del(`ranking:lot:${lotId}`);

      return createdBid;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Já existe proposta ativa para este fornecedor neste lote",
        );
      }

      throw error;
    }
  }
}
