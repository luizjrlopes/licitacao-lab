import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type AuditLogInput = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadataJson?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}

  listLogs(limit = 100): Promise<
    Array<{
      id: string;
      actorUserId: string;
      action: string;
      entityType: string;
      entityId: string;
      metadataJson: Prisma.JsonValue;
      createdAt: Date;
      actorUser: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }>
  > {
    const safeLimit = Math.min(Math.max(limit, 1), 200);

    return this.prismaService.auditLog.findMany({
      take: safeLimit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        metadataJson: true,
        createdAt: true,
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async logAction(
    input: AuditLogInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadataJson: input.metadataJson,
      },
    });
  }
}
