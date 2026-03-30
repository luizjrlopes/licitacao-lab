import { Module } from "@nestjs/common";
import { BidsController } from "./bids.controller";
import { BidsService } from "./bids.service";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [RedisModule],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
