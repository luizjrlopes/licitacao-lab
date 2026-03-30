import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { NoticeStatus, UserRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { JwtUser } from "../auth/types/jwt-user.type";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ListNoticesQueryDto } from "./dto/list-notices-query.dto";
import { NoticesService } from "./notices.service";

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller("notices")
@UseGuards(JwtAuthGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createNoticeDto: CreateNoticeDto,
    @Req() req: AuthenticatedRequest,
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
    return this.noticesService.create(req.user.sub, createNoticeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
  list(@Query() query: ListNoticesQueryDto): Promise<
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
    return this.noticesService.list(query);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.SUPPLIER)
  detail(@Param("id", new ParseUUIDPipe()) id: string): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.noticesService.detail(id);
  }

  @Patch(":id/publish")
  @Roles(UserRole.ADMIN)
  publish(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
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
    return this.noticesService.publish(req.user.sub, id);
  }

  @Patch(":id/close")
  @Roles(UserRole.ADMIN)
  close(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
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
    return this.noticesService.close(req.user.sub, id);
  }
}
