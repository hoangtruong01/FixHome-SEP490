// src/modules/services/dto/create-service.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class CreateServiceDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'ID danh mục',
  })
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  @IsNotEmpty({ message: 'categoryId is required' })
  categoryId: string;

  @ApiProperty({
    example: 'Sửa điều hòa không mát',
    description: 'Tên dịch vụ',
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @Trim()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'SUA_DH_KHONG_MAT',
    description: 'Mã định danh duy nhất của dịch vụ',
  })
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  @Trim()
  @MinLength(1)
  @MaxLength(200)
  code: string;

  @ApiPropertyOptional({
    example: 'sua-dieu-hoa-khong-mat',
    description: 'URL slug thân thiện',
  })
  @IsOptional()
  @IsString()
  @Trim()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Kiểm tra gas, block, vệ sinh lưới lọc',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Giá sàn/khảo sát cơ sở',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  basePrice?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Khoảng giá tối thiểu (basePriceMin)',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Khoảng giá tối đa (basePriceMax)',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999.99)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Thời gian ước tính hoàn thành (phút)',
    default: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional({ default: true })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
