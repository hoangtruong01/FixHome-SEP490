// src/modules/technician-verifications/dto/review-verification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class RejectVerificationDto {
  @ApiProperty({
    example:
      'Ảnh chứng minh nhân dân mờ, không nhìn rõ số CCCD. Vui lòng chụp lại rõ nét.',
    description: 'Lý do từ chối hồ sơ xác minh',
  })
  @IsString()
  @Trim()
  @MaxLength(2000)
  @MinLength(5, {
    message: 'rejectionReason must be at least 5 characters long',
  })
  rejectionReason: string;
}
