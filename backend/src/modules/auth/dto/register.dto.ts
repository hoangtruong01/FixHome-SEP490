// src/modules/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsByteLength,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Trim, Phone } from '../../../shared/validation/input.transforms';
import { Role } from '../../../shared/enums';

export class RegisterDto {
  @ApiProperty({
    example: 'customer@fixhome.vn',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @Trim()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @IsByteLength(0, 72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'password requires uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Full name' })
  @IsString()
  @Trim()
  @MinLength(2)
  @MaxLength(200)
  @IsNotEmpty({ message: 'fullName is required' })
  fullName: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Vietnamese phone number',
  })
  @IsOptional()
  @IsString()
  @Phone()
  @Matches(/^0[35789][0-9]{8}$/, {
    message: 'phoneNumber must be a valid Vietnamese phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    enum: [Role.CUSTOMER, Role.TECHNICIAN],
    default: Role.CUSTOMER,
    description: 'Registration role (CUSTOMER or TECHNICIAN only)',
  })
  @ValidateIf((_dto, value) => value !== undefined)
  @IsEnum(Role, { message: 'role must be a valid role' })
  @IsIn([Role.CUSTOMER, Role.TECHNICIAN])
  role?: Role = Role.CUSTOMER;
}
