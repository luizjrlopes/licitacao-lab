import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { NoticeStatus, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { ListNoticesQueryDto } from "./dto/list-notices-query.dto";
import { NoticesService } from "./notices.service";

@Controller("notices")
@UseGuards(JwtAuthGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createNoticeDto: CreateNoticeDto): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.noticesService.create(createNoticeDto);
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
  publish(@Param("id", new ParseUUIDPipe()) id: string): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.noticesService.publish(id);
  }

  @Patch(":id/close")
  @Roles(UserRole.ADMIN)
  close(@Param("id", new ParseUUIDPipe()) id: string): Promise<{
    id: string;
    title: string;
    description: string;
    status: NoticeStatus;
    publishedAt: Date | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.noticesService.close(id);
  }
}
