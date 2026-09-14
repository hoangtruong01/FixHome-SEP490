// src/modules/services/services.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { ServiceCategory } from '../categories/entities/category.entity';
import { ServicePricingMode } from '../../shared/enums';

describe('ServicesService', () => {
  let servicesService: ServicesService;
  let serviceRepository: any;
  let categoryRepository: any;

  const mockCategory: ServiceCategory = {
    id: 'cat-uuid-1',
    name: 'Điện lạnh',
    code: 'DIEN_LANH',
    slug: 'dien-lanh',
    iconKey: 'Snowflake',
    sortOrder: 1,
    description: 'Sửa điều hòa, tủ lạnh',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [],
  };

  const createMockService = (): Service => ({
    id: 'svc-uuid-1',
    categoryId: 'cat-uuid-1',
    category: mockCategory,
    name: 'Sửa điều hòa',
    code: 'SUA_DH',
    slug: 'sua-dieu-hoa',
    description: 'Sửa điều hòa tại nhà',
    basePrice: 150000,
    minPrice: 100000,
    maxPrice: 500000,
    pricingMode: ServicePricingMode.INSPECTION_REQUIRED,
    unit: 'lần',
    fixedPrice: null,
    scopeDescription: null,
    estimatedMinutes: 60,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    basePriceMin: 100000,
    basePriceMax: 500000,
  });

  beforeEach(() => {
    serviceRepository = {
      findOne: vi.fn(),
      create: vi
        .fn()
        .mockImplementation((data) => ({ ...createMockService(), ...data })),
      save: vi.fn().mockImplementation((data) => Promise.resolve({ ...data })),
      createQueryBuilder: vi.fn().mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[createMockService()], 1]),
      }),
    };

    categoryRepository = {
      findOne: vi.fn(),
    };

    servicesService = new ServicesService(
      serviceRepository,
      categoryRepository,
    );
  });

  describe('findServices', () => {
    it('returns paginated services list', async () => {
      const result = await servicesService.findServices({
        page: 1,
        limit: 10,
        skip: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('returns service when found', async () => {
      serviceRepository.findOne.mockResolvedValue(createMockService());

      const result = await servicesService.findById('svc-uuid-1');
      expect(result.id).toBe('svc-uuid-1');
      expect(result.name).toBe('Sửa điều hòa');
    });

    it('throws NotFoundException when service not found', async () => {
      serviceRepository.findOne.mockResolvedValue(null);

      await expect(servicesService.findById('svc-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a service successfully', async () => {
      serviceRepository.findOne.mockResolvedValue(null); // code check
      categoryRepository.findOne.mockResolvedValue(mockCategory); // category check

      const result = await servicesService.create({
        categoryId: 'cat-uuid-1',
        name: 'Sửa điều hòa',
        code: 'SUA_DH',
        basePrice: 150000,
      });

      expect(result.code).toBe('SUA_DH');
      expect(result.basePrice).toBe(150000);
    });

    it('throws ConflictException when service code is duplicated', async () => {
      serviceRepository.findOne.mockResolvedValue(createMockService());

      await expect(
        servicesService.create({
          categoryId: 'cat-uuid-1',
          name: 'Sửa điều hòa trùng mã',
          code: 'SUA_DH',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when category does not exist', async () => {
      serviceRepository.findOne.mockResolvedValue(null);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        servicesService.create({
          categoryId: 'cat-non-existent',
          name: 'Sửa điều hòa',
          code: 'SUA_DH_NEW',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleStatus', () => {
    it('updates active status of service', async () => {
      serviceRepository.findOne.mockResolvedValue(createMockService());

      const result = await servicesService.toggleStatus('svc-uuid-1', false);
      expect(result.isActive).toBe(false);
    });
  });
});
