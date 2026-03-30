import { Module } from "@nestjs/common";
import { LotsController } from "./lots.controller";
import { LotsService } from "./lots.service";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [RedisModule],
  controllers: [LotsController],
  providers: [LotsService],
})
export class LotsModule {}
