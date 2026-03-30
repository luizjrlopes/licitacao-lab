import {
  Body,
  Controller,
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
import { CreateBidDto } from "./dto/create-bid.dto";
import { BidsService } from "./bids.service";

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller()
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

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
