// src/modules/users/dto/update-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Trim, Phone } from '../../../shared/validation/input.transforms';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van B',
    description: 'Updated full name',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @Trim()
  @MaxLength(200)
  @IsString()
  @MinLength(2, { message: 'fullName must be at least 2 characters long' })
  fullName?: string;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Updated Vietnamese phone number',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @Phone()
  @IsString()
  @Matches(/^0[35789][0-9]{8}$/, {
    message: 'phoneNumber must be a valid Vietnamese phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
    description: 'Updated avatar URL',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsString()
  avatarUrl?: string;
}

