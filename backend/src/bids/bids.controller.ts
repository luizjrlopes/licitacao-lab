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
import { Prisma, UserRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateBidDto } from "./dto/create-bid.dto";
import { BidsService } from "./bids.service";

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get("me/bids")
  @Roles(UserRole.SUPPLIER)
  listMine(@Req() req: AuthenticatedRequest): Promise<
    Array<{
      id: string;
      lotId: string;
      supplierId: string;
      amount: Prisma.Decimal;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      lot: {
        id: string;
        code: string;
        description: string;
        notice: {
          id: string;
          title: string;
          status: string;
        };
      };
    }>
  > {
    return this.bidsService.listMine(req.user);
  }

  @Post("lots/:lotId/bids")
  @Roles(UserRole.SUPPLIER)
  create(
    @Param("lotId", new ParseUUIDPipe()) lotId: string,
    @Body() createBidDto: CreateBidDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{
    id: string;
    lotId: string;
    supplierId: string;
    amount: Prisma.Decimal;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.bidsService.create(lotId, req.user, createBidDto);
  }
}
