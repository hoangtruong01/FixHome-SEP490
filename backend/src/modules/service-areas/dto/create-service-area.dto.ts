// src/modules/service-areas/dto/create-service-area.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class CreateServiceAreaDto {
  @ApiProperty({ example: '01', description: 'Mã tỉnh/thành phố' })
  @IsString()
  @IsNotEmpty({ message: 'provinceCode is required' })
  @Trim()
  provinceCode: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Tên tỉnh/thành phố' })
  @IsString()
  @IsNotEmpty({ message: 'provinceName is required' })
  @Trim()
  provinceName: string;

  @ApiProperty({ example: '001', description: 'Mã quận/huyện' })
  @IsString()
  @IsNotEmpty({ message: 'districtCode is required' })
  @Trim()
  districtCode: string;

  @ApiProperty({ example: 'Quận Ba Đình', description: 'Tên quận/huyện' })
  @IsString()
  @IsNotEmpty({ message: 'districtName is required' })
  @Trim()
  districtName: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
