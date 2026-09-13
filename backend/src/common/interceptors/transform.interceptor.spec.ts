// src/common/interceptors/transform.interceptor.spec.ts
import { describe, expect, it } from 'vitest';
import { of } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor();

  const createMockContext = (statusCode = 200): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    } as unknown as ExecutionContext;
  };

  it('wraps raw data in standard { success: true, statusCode, message, data } format', async () => {
    const context = createMockContext(200);
    const handler: CallHandler = {
      handle: () => of({ id: '123', name: 'Plumbing Service' }),
    };

    const observable = interceptor.intercept(context, handler);
    const result = await new Promise((resolve) =>
      observable.subscribe(resolve),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: 'Success',
      data: { id: '123', name: 'Plumbing Service' },
    });
  });

  it('preserves existing success envelope without double-wrapping', async () => {
    const context = createMockContext(201);
    const handler: CallHandler = {
      handle: () =>
        of({
          success: true,
          statusCode: 201,
          message: 'Created successfully',
          data: { id: '456' },
        }),
    };

    const observable = interceptor.intercept(context, handler);
    const result = await new Promise((resolve) =>
      observable.subscribe(resolve),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 201,
      message: 'Created successfully',
      data: { id: '456' },
    });
  });

  it('handles paginated response containing meta correctly', async () => {
    const context = createMockContext(200);
    const handler: CallHandler = {
      handle: () =>
        of({
          data: [{ id: '1' }, { id: '2' }],
          meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
          message: 'List fetched',
        }),
    };

    const observable = interceptor.intercept(context, handler);
    const result = await new Promise((resolve) =>
      observable.subscribe(resolve),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: 'List fetched',
      data: [{ id: '1' }, { id: '2' }],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  });

  it('handles null data gracefully', async () => {
    const context = createMockContext(204);
    const handler: CallHandler = {
      handle: () => of(null),
    };

    const observable = interceptor.intercept(context, handler);
    const result = await new Promise((resolve) =>
      observable.subscribe(resolve),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 204,
      message: 'Success',
      data: null,
    });
  });
});
