import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Điện lạnh',
    description: 'Tên danh mục dịch vụ',
  })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  @Trim()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'DIEN_LANH',
    description: 'Mã định danh danh mục (duy nhất)',
  })
  @IsString()
  @IsNotEmpty({ message: 'code is required' })
  @Trim()
  @MinLength(1)
  @MaxLength(200)
  code: string;

  @ApiPropertyOptional({
    example: 'dien-lanh',
    description: 'URL slug thân thiện',
  })
  @IsOptional()
  @IsString()
  @Trim()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Snowflake',
    description: 'Lucide icon key',
  })
  @IsOptional()
  @IsString()
  @Trim()
  iconKey?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Thứ tự sắp xếp hiển thị',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: 'Dịch vụ sửa chữa điều hòa, tủ lạnh, máy giặt',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;
}
