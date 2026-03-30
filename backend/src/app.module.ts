import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { NoticesModule } from "./notices/notices.module";
import { LotsModule } from "./lots/lots.module";
import { BidsModule } from "./bids/bids.module";
import { RedisModule } from "./redis/redis.module";
import { AuditModule } from "./audit/audit.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    RedisModule,
    UsersModule,
    NoticesModule,
    LotsModule,
    BidsModule,
    HealthModule,
  ],
})
export class AppModule {}
