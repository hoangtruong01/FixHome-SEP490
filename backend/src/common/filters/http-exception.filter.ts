// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        if (responseObj.code) {
          code = String(responseObj.code);
        }

        if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
          message = 'Validation failed';
          code = 'VALIDATION_FAILED';
        }
      }

      if (code === 'INTERNAL_SERVER_ERROR') {
        code = this.getErrorCodeFromStatus(status);
      }
    } else if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code?: string }).code === '23505'
    ) {
      status = HttpStatus.CONFLICT;
      message = 'A record with these identifiers already exists';
      code = 'CONFLICT';
    } else if (
      exception instanceof QueryFailedError &&
      (exception.driverError as { code?: string }).code === '23514'
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Data violates a business constraint';
      code = 'BAD_REQUEST';
    }
    if (status >= 500) {
      // Neither SQL parameters, query strings, nor exception messages enter logs/responses.
      this.logger.error(
        `Request failed: ${request.method} ${request.path || request.url.split('?')[0]} (${status})`,
      );
      message =
        status === 503 ? 'Service unavailable' : 'Internal server error';
      code = this.getErrorCodeFromStatus(status);
      details = undefined;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.path || request.url.split('?')[0],
    });
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return HttpStatus[status] || 'INTERNAL_SERVER_ERROR';
    }
  }
}
