// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return {
            success: true,
            statusCode,
            message: 'Success',
            data: null as unknown as T,
          };
        }

        // If already formatted with success property
        if (
          typeof data === 'object' &&
          'success' in data &&
          typeof (data as Record<string, unknown>).success === 'boolean'
        ) {
          const resObj = data as Record<string, unknown>;
          return {
            success: resObj.success as boolean,
            statusCode: (resObj.statusCode as number) || statusCode,
            message: (resObj.message as string) || 'Success',
            data: (resObj.data as T) ?? (null as unknown as T),
            ...(resObj.meta ? { meta: resObj.meta } : {}),
          };
        }

        // If paginated structure with { data, meta, message? }
        if (typeof data === 'object' && 'data' in data && 'meta' in data) {
          const {
            data: innerData,
            meta,
            message,
          } = data as Record<string, unknown>;
          return {
            success: true,
            statusCode,
            message: (message as string) || 'Success',
            data: innerData as T,
            meta,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
