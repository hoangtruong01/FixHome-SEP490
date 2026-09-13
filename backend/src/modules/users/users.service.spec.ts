// src/modules/users/users.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Role, AccountStatus } from '../../shared/enums';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: any;
  let refreshTokenRepository: any;

  const createMockUser = (): User => ({
    id: 'user-123',
    email: 'user@fixhome.vn',
    passwordHash: 'hash',
    fullName: 'Nguyen Van A',
    phoneNumber: '0912345678',
    role: Role.CUSTOMER,
    status: AccountStatus.ACTIVE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  });

  beforeEach(() => {
    userRepository = {
      findOne: vi.fn(),
      save: vi.fn().mockImplementation((u) => Promise.resolve({ ...u })),
      update: vi.fn().mockImplementation((_id, changes) => {
        userRepository.findOne.mockResolvedValue({
          ...createMockUser(),
          ...changes,
        });
        return Promise.resolve({ affected: 1 });
      }),
      createQueryBuilder: vi.fn().mockReturnValue({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[createMockUser()], 1]),
      }),
    };

    refreshTokenRepository = {
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    const manager = {
      getRepository: (entity: unknown) =>
        entity === RefreshToken ? refreshTokenRepository : userRepository,
    };
    userRepository.manager = {
      transaction: (fn: (m: typeof manager) => unknown) => fn(manager),
    };
    const auditLogService = {
      log: vi.fn().mockResolvedValue(undefined),
      logWithManager: vi.fn().mockResolvedValue(undefined),
    };
    usersService = new UsersService(userRepository, auditLogService as any);
  });

  describe('getProfile', () => {
    it('returns user profile when found', async () => {
      userRepository.findOne.mockResolvedValue(createMockUser());

      const user = await usersService.getProfile('user-123');
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('user@fixhome.vn');
    });

    it('throws NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getProfile('user-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('updates fullName and phoneNumber successfully', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(createMockUser()) // getProfile
        .mockResolvedValueOnce(null); // phone uniqueness check

      const updated = await usersService.updateProfile('user-123', {
        fullName: 'Nguyen Van Updated',
        phoneNumber: '0987654321',
      });

      expect(updated.fullName).toBe('Nguyen Van Updated');
      expect(updated.phoneNumber).toBe('0987654321');
    });

    it('throws ConflictException when phoneNumber is used by another user', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(createMockUser()) // getProfile
        .mockResolvedValueOnce({ id: 'user-other', phoneNumber: '0987654321' }); // phone conflict

      await expect(
        usersService.updateProfile('user-123', {
          phoneNumber: '0987654321',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findUsers', () => {
    it('queries users with pagination and filters', async () => {
      const result = await usersService.findUsers({
        page: 1,
        limit: 10,
        role: Role.CUSTOMER,
        status: AccountStatus.ACTIVE,
        search: 'Nguyen',
        skip: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('updateUserStatus', () => {
    it('locks user and revokes all active refresh tokens', async () => {
      userRepository.findOne.mockResolvedValue(createMockUser());

      const updated = await usersService.updateUserStatus('user-123', {
        status: AccountStatus.LOCKED,
      });

      expect(updated.status).toBe(AccountStatus.LOCKED);
      expect(updated.isActive).toBe(false);
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isRevoked: false },
        { isRevoked: true },
      );
    });

    it('activates user without revoking tokens', async () => {
      const lockedUser = { ...createMockUser(), status: AccountStatus.LOCKED };
      userRepository.findOne.mockResolvedValue(lockedUser);

      const updated = await usersService.updateUserStatus('user-123', {
        status: AccountStatus.ACTIVE,
      });

      expect(updated.status).toBe(AccountStatus.ACTIVE);
      expect(updated.isActive).toBe(true);
      expect(refreshTokenRepository.update).not.toHaveBeenCalled();
    });
  });
});
