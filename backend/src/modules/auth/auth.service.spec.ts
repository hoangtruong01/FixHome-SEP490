// src/modules/auth/auth.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role, AccountStatus } from '../../shared/enums';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: any;
  let refreshTokenRepository: any;
  let jwtService: any;
  let configService: any;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'customer@fixhome.vn',
    passwordHash: '',
    fullName: 'Nguyen Van A',
    phoneNumber: '0912345678',
    role: Role.CUSTOMER,
    status: AccountStatus.ACTIVE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('SecurePassword123!', 10);

    userRepository = {
      findOne: vi.fn(),
      create: vi.fn().mockImplementation((data) => ({ ...mockUser, ...data })),
      save: vi
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ ...mockUser, ...data }),
        ),
    };

    refreshTokenRepository = {
      findOne: vi.fn(),
      create: vi
        .fn()
        .mockImplementation((data) => ({ id: 'token-uuid', ...data })),
      save: vi
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ id: 'token-uuid', ...data }),
        ),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    jwtService = {
      decode: vi
        .fn()
        .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 604800 }),
      sign: vi.fn().mockReturnValue('mocked-jwt-token'),
      verify: vi
        .fn()
        .mockReturnValue({
          sub: mockUser.id,
          exp: Math.floor(Date.now() / 1000) + 604800,
        }),
    };

    configService = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return undefined;
      }),
    };

    configService.getOrThrow = configService.get;
    const manager = {
      getRepository: (entity: unknown) =>
        entity === User ? userRepository : refreshTokenRepository,
    };
    userRepository.manager = {
      transaction: (fn: (m: typeof manager) => unknown) => fn(manager),
    };
    authService = new AuthService(userRepository, jwtService, configService);
  });

  describe('register', () => {
    it('registers a new Customer successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await authService.register({
        email: 'customer@fixhome.vn',
        password: 'SecurePassword123!',
        fullName: 'Nguyen Van A',
        role: Role.CUSTOMER,
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.refreshToken).toBe('mocked-jwt-token');
      expect(result.user.email).toBe('customer@fixhome.vn');
      expect(result.user.role).toBe(Role.CUSTOMER);
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('rejects public registration for TECHNICIAN role (P4.3: created by SM/Admin)', async () => {
      await expect(
        authService.register({
          email: 'tech@fixhome.vn',
          password: 'SecurePassword123!',
          fullName: 'Tran Van Tech',
          role: Role.TECHNICIAN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects public registration for ADMIN role', async () => {
      await expect(
        authService.register({
          email: 'admin@fixhome.vn',
          password: 'Password123!',
          fullName: 'Admin User',
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects public registration for SERVICE_MANAGER role', async () => {
      await expect(
        authService.register({
          email: 'manager@fixhome.vn',
          password: 'Password123!',
          fullName: 'Manager User',
          role: Role.SERVICE_MANAGER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects registration with duplicate email', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(
        authService.register({
          email: 'customer@fixhome.vn',
          password: 'Password123!',
          fullName: 'Nguyen Van A',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects registration with duplicate phone number', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // phone check

      await expect(
        authService.register({
          email: 'new@fixhome.vn',
          phoneNumber: '0912345678',
          password: 'Password123!',
          fullName: 'Duplicate Phone',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('logs in user successfully with correct credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'customer@fixhome.vn',
        password: 'SecurePassword123!',
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.refreshToken).toBe('mocked-jwt-token');
      expect(result.user.email).toBe('customer@fixhome.vn');
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@fixhome.vn',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'customer@fixhome.vn',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when account is LOCKED', async () => {
      const lockedUser = { ...mockUser, status: AccountStatus.LOCKED };
      userRepository.findOne.mockResolvedValue(lockedUser);

      await expect(
        authService.login({
          email: 'customer@fixhome.vn',
          password: 'SecurePassword123!',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when account is SUSPENDED', async () => {
      const suspendedUser = { ...mockUser, status: AccountStatus.SUSPENDED };
      userRepository.findOne.mockResolvedValue(suspendedUser);

      await expect(
        authService.login({
          email: 'customer@fixhome.vn',
          password: 'SecurePassword123!',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh token rotation', () => {
    it('rotates refresh token and returns new tokens', async () => {
      const tokenRecord: RefreshToken = {
        id: 'token-uuid',
        userId: mockUser.id,
        user: mockUser,
        tokenHash: 'hashed_token',
        expiresAt: new Date(Date.now() + 1000000),
        isRevoked: false,
        deviceInfo: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      refreshTokenRepository.findOne.mockResolvedValue(tokenRecord);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.refresh({
        refreshToken: 'valid-refresh-token',
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.refreshToken).toBe('mocked-jwt-token');
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { id: 'token-uuid', isRevoked: false },
        { isRevoked: true },
      );
    });

    it('rejects when refresh token is revoked or not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.refresh({ refreshToken: 'revoked-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('invalidates refresh tokens on logout', async () => {
      const result = await authService.logout(mockUser.id);
      expect(result.loggedOut).toBe(true);
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.id, isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('getMe', () => {
    it('returns current user profile', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const profile = await authService.getMe(mockUser.id);
      expect(profile.id).toBe(mockUser.id);
      expect(profile.email).toBe(mockUser.email);
      expect((profile as any).passwordHash).toBeUndefined();
    });
  });
});
