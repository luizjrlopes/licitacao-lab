import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method = request.method;
    const route = request.originalUrl ?? request.url;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          const statusCode = response.statusCode;

          this.logger.log(
            JSON.stringify({
              event: "http_request",
              method,
              route,
              statusCode,
              durationMs,
            }),
          );
        },
        error: () => {
          const durationMs = Date.now() - start;
          const statusCode = response.statusCode;

          this.logger.error(
            JSON.stringify({
              event: "http_request",
              method,
              route,
              statusCode,
              durationMs,
            }),
          );
        },
      }),
    );
  }
}
