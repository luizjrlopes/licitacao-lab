import { NoticeStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class ListNoticesQueryDto {
  @IsOptional()
  @IsEnum(NoticeStatus)
  status?: NoticeStatus;
}
