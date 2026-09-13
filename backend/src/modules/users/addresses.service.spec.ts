// src/modules/users/addresses.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: any;

  const mockAddress: Address = {
    id: 'addr-uuid-1',
    userId: 'user-uuid-1',
    label: 'Nhà riêng',
    line1: '123 Nguyen Trai',
    ward: 'Phuong Ben Thanh',
    district: 'Quan 1',
    province: 'TP. Ho Chi Minh',
    lat: 10.7769,
    lng: 106.7009,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Address;

  beforeEach(() => {
    repo = {
      find: vi.fn().mockResolvedValue([mockAddress]),
      findOne: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockImplementation((dto) => ({ ...mockAddress, ...dto })),
      save: vi.fn().mockImplementation((a) => Promise.resolve(a)),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      remove: vi.fn().mockResolvedValue(mockAddress),
    };

    service = new AddressesService(repo);
  });

  describe('findByUserId', () => {
    it('returns addresses ordered by isDefault DESC', async () => {
      const result = await service.findByUserId('user-uuid-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('addr-uuid-1');
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('returns address when found', async () => {
      repo.findOne.mockResolvedValue(mockAddress);
      const result = await service.findOne('user-uuid-1', 'addr-uuid-1');
      expect(result.id).toBe('addr-uuid-1');
    });

    it('throws NotFoundException when address not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.findOne('user-uuid-1', 'addr-uuid-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates address and sets default when first address', async () => {
      repo.count.mockResolvedValue(0);
      const result = await service.create('user-uuid-1', {
        line1: '456 Le Loi',
        district: 'Quan 1',
        province: 'TP. Ho Chi Minh',
      });
      expect(result.isDefault).toBe(true);
      expect(repo.save).toHaveBeenCalled();
    });

    it('clears previous default if new address isDefault is true', async () => {
      repo.count.mockResolvedValue(2);
      await service.create('user-uuid-1', {
        line1: '789 Tran Hung Dao',
        district: 'Quan 5',
        province: 'TP. Ho Chi Minh',
        isDefault: true,
      });
      expect(repo.update).toHaveBeenCalledWith(
        { userId: 'user-uuid-1', isDefault: true },
        { isDefault: false },
      );
    });
  });

  describe('remove', () => {
    it('removes address when found', async () => {
      repo.findOne.mockResolvedValue(mockAddress);
      await service.remove('user-uuid-1', 'addr-uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(mockAddress);
    });
  });
});
