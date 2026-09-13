// src/modules/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role, AccountStatus } from '../../../shared/enums';
import type { User } from '../../users/entities/user.entity';

export class UserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'customer@fixhome.vn' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: '0912345678', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ enum: Role, example: Role.CUSTOMER })
  role: Role;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  status: AccountStatus;

  @ApiProperty({ example: '2026-09-09T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true, example: null })
  avatarUrl?: string | null;

  @ApiProperty({ nullable: true, example: null })
  bookingSuspendedUntil?: Date | null;

  @ApiProperty({ type: [String], example: ['booking:create', 'profile:read_own'] })
  permissions?: string[];

  static fromUser(user: User, permissions?: string[]): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl ?? null,
      bookingSuspendedUntil: user.bookingSuspendedUntil ?? null,
      permissions: permissions ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token (15m)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Refresh Token (7d)',
  })
  refreshToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

export class TokenRefreshResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New JWT Access Token (15m)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Rotated JWT Refresh Token (7d)',
  })
  refreshToken: string;
}
