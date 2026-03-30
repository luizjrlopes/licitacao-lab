import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

type HttpExceptionResponse =
  | string
  | {
      message?: string | string[];
      error?: string;
    };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? (exception.getResponse() as HttpExceptionResponse)
      : "Erro interno do servidor";

    const { message, error, details } = this.normalizeResponse(
      statusCode,
      exceptionResponse,
    );

    const payload = {
      statusCode,
      error,
      message,
      details,
      method: request.method,
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      this.logger.error(JSON.stringify(payload));
    } else {
      this.logger.warn(JSON.stringify(payload));
    }

    response.status(statusCode).json(payload);
  }

  private normalizeResponse(
    statusCode: number,
    exceptionResponse: HttpExceptionResponse,
  ): {
    message: string;
    error: string;
    details?: string[];
  } {
    if (typeof exceptionResponse === "string") {
      return {
        message: exceptionResponse,
        error: this.defaultErrorLabel(statusCode),
      };
    }

    const rawMessage = exceptionResponse.message;
    const details = Array.isArray(rawMessage) ? rawMessage : undefined;
    const message = Array.isArray(rawMessage)
      ? "Dados de entrada inválidos"
      : (rawMessage ?? "Erro inesperado");

    return {
      message,
      error: exceptionResponse.error ?? this.defaultErrorLabel(statusCode),
      details,
    };
  }

  private defaultErrorLabel(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return "Bad Request";
      case HttpStatus.UNAUTHORIZED:
        return "Unauthorized";
      case HttpStatus.FORBIDDEN:
        return "Forbidden";
      case HttpStatus.NOT_FOUND:
        return "Not Found";
      case HttpStatus.CONFLICT:
        return "Conflict";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "Unprocessable Entity";
      default:
        return "Internal Server Error";
    }
  }
}
