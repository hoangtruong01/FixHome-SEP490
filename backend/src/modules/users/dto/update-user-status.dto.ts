// src/modules/users/dto/update-user-status.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '../../../shared/enums';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.LOCKED,
    description: 'New account status',
  })
  @IsEnum(AccountStatus, { message: 'status must be a valid account status' })
  @IsNotEmpty({ message: 'status is required' })
  status: AccountStatus;

  @ApiPropertyOptional({
    example: 'Suspicious spam activity reported',
    description: 'Reason for status change',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
