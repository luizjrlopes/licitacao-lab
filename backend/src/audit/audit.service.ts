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
