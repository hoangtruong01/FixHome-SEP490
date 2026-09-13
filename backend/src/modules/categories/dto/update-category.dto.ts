// src/modules/categories/dto/update-category.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Điện lạnh dân dụng' })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  @Trim()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'dien-lanh' })
  @IsOptional()
  @IsString()
  @Trim()
  slug?: string;

  @ApiPropertyOptional({ example: 'Snowflake' })
  @IsOptional()
  @IsString()
  @Trim()
  iconKey?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: 'Mô tả chi tiết cập nhật' })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
