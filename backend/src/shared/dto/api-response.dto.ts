// src/shared/dto/api-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: PaginationMeta })
  meta?: PaginationMeta;

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    return response;
  }

  static created<T>(data: T, message = 'Created'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.statusCode = 201;
    response.message = message;
    response.data = data;
    return response;
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
  ): ApiResponseDto<T[]> {
    const response = new ApiResponseDto<T[]>();
    response.success = true;
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    response.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return response;
  }
}

export class ApiErrorDetailDto {
  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional({ example: ['email must be a valid email'] })
  details?: unknown;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ type: ApiErrorDetailDto })
  error: ApiErrorDetailDto;

  @ApiProperty({ example: '2026-09-09T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/auth/register' })
  path: string;
}
