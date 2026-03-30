import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);
  const frontendOrigin = configService.get<string>(
    "FRONTEND_ORIGIN",
    "http://localhost:5173",
  );

  const corsOrigins = frontendOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: corsOrigins,
  });

  const port = configService.get<number>("PORT", 3000);

  await app.listen(port, "0.0.0.0");
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
