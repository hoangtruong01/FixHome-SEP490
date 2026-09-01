// src/shared/dto/api-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional({ type: PaginationMeta })
  meta?: PaginationMeta;

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    return response;
  }

  static created<T>(data: T, message = 'Created'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
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
