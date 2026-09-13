// src/modules/technician-verifications/dto/query-verifications.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../shared/dto';
import { VerificationStatus } from '../../../shared/enums';

export class QueryVerificationsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: VerificationStatus,
    description: 'Filter by verification status (PENDING, APPROVED, REJECTED)',
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;
}
