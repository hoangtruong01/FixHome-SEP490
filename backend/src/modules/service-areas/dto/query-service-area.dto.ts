// src/modules/service-areas/dto/query-service-area.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryServiceAreaDto {
  @ApiPropertyOptional({ example: '01', description: 'Lọc theo mã tỉnh/thành phố' })
  @IsOptional()
  @IsString()
  provinceCode?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
