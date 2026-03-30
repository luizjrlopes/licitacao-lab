import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisClientType, createClient } from "redis";

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private isReady = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>("REDIS_HOST", "redis");
    const port = this.configService.get<number>("REDIS_PORT", 6379);

    this.client = createClient({
      socket: {
        host,
        port,
      },
    });

    this.client.on("error", (error) => {
      this.logger.warn(`Redis indisponível: ${error.message}`);
      this.isReady = false;
    });

    try {
      await this.client.connect();
      this.isReady = true;
      this.logger.log(`Redis conectado em ${host}:${port}`);
    } catch (error) {
      this.logger.warn(
        "Redis não conectado no bootstrap. Cache ficará desabilitado.",
      );
      this.isReady = false;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isReady) {
      return null;
    }

    try {
      const raw = await this.client.get(key);
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    if (!this.client || !this.isReady) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
    } catch {
      // Cache é melhor esforço
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isReady) {
      return;
    }

    try {
      await this.client.del(key);
    } catch {
      // Cache é melhor esforço
    }
  }
}
