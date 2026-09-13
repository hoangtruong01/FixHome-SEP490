// src/common/filters/http-exception.filter.spec.ts
import { describe, expect, it, vi } from 'vitest';
import {
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  const createMockArgumentsHost = (url = '/api/v1/test') => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ url, method: 'GET' }),
        getResponse: () => ({ status: statusMock }),
      }),
    } as unknown as ArgumentsHost;

    return { host, statusMock, jsonMock };
  };

  it('formats standard HttpException correctly', () => {
    const { host, statusMock, jsonMock } =
      createMockArgumentsHost('/api/v1/users/999');
    const exception = new NotFoundException('User not found');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
        path: '/api/v1/users/999',
      }),
    );
  });

  it('formats ValidationPipe error array with code VALIDATION_FAILED and details', () => {
    const { host, statusMock, jsonMock } = createMockArgumentsHost(
      '/api/v1/auth/register',
    );
    const validationMessages = [
      'email must be an email',
      'password is too short',
    ];
    const exception = new BadRequestException({
      message: validationMessages,
      error: 'Bad Request',
      statusCode: 400,
    });

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details: validationMessages,
        },
        path: '/api/v1/auth/register',
      }),
    );
  });

  it('hides internal error messages in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { host, statusMock, jsonMock } =
      createMockArgumentsHost('/api/v1/internal');
    const exception = new Error('SELECT * FROM secret_table syntax error');

    filter.catch(exception, host);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      }),
    );

    process.env.NODE_ENV = originalEnv;
  });
});
