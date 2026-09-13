// src/modules/auth/dto/login.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../../shared/validation/input.transforms';

export class LoginDto {
  @ApiPropertyOptional({
    example: 'customer@fixhome.vn',
    description: 'Email or phone number',
  })
  @IsString()
  @Trim()
  @MaxLength(254)
  @ValidateIf(
    (dto, value) => value !== undefined || dto.identifier === undefined,
  )
  @IsNotEmpty({ message: 'email or identifier is required' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Email or phone; preferred alias for email',
  })
  @ValidateIf((dto, value) => value !== undefined || dto.email === undefined)
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  identifier?: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MaxLength(1024)
  password: string;

  @ApiPropertyOptional({
    example: 'Mobile App - React Native on iOS',
    description: 'Device metadata for session tracking',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deviceInfo?: string;
}
