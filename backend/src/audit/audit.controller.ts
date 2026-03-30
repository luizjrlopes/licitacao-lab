import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditService } from "./audit.service";

@Controller("audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query("limit") limit?: string): Promise<
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
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.auditService.listLogs(parsedLimit);
  }
}
