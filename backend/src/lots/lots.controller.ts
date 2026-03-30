import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { NoticeStatus, Prisma, UserRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateLotDto } from "./dto/create-lot.dto";
import { LotsService } from "./lots.service";

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post("notices/:noticeId/lots")
  @Roles(UserRole.ADMIN)
  create(
    @Param("noticeId", new ParseUUIDPipe()) noticeId: string,
    @Body() createLotDto: CreateLotDto,
    @Req() req: AuthenticatedRequest,
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
    return this.lotsService.create(req.user.sub, noticeId, createLotDto);
  }

  @Get("lots/:id")
  @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
  detail(@Param("id", new ParseUUIDPipe()) id: string): Promise<{
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
    return this.lotsService.detail(id);
  }

  @Get("lots/:id/ranking")
  @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
  ranking(@Param("id", new ParseUUIDPipe()) id: string): Promise<{
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
    return this.lotsService.getRanking(id);
  }
}
