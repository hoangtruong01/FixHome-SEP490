// src/modules/service-areas/service-areas.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service';
import { ServiceArea } from './entities/service-area.entity';
import { Role } from '../../shared/enums';

describe('ServiceAreasService', () => {
  let serviceAreasService: ServiceAreasService;
  let serviceAreaRepo: any;
  let auditLogService: any;

  const mockArea: ServiceArea = {
    id: 'area-uuid-1',
    provinceCode: '01',
    provinceName: 'Hà Nội',
    districtCode: '001',
    districtName: 'Quận Ba Đình',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActor: any = {
    id: 'admin-uuid',
    role: Role.ADMIN,
  };

  beforeEach(() => {
    serviceAreaRepo = {
      findOne: vi.fn(),
      find: vi.fn().mockResolvedValue([mockArea]),
      create: vi.fn().mockImplementation((d) => ({ ...mockArea, ...d })),
      save: vi.fn().mockImplementation((d) => Promise.resolve({ ...d })),
      createQueryBuilder: vi.fn().mockReturnValue({
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        addOrderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([mockArea]),
      }),
    };

    auditLogService = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    serviceAreasService = new ServiceAreasService(
      serviceAreaRepo,
      auditLogService,
    );
  });

  describe('findAll', () => {
    it('returns service areas list', async () => {
      const result = await serviceAreasService.findAll({ provinceCode: '01' });
      expect(result).toHaveLength(1);
      expect(result[0].provinceCode).toBe('01');
    });
  });

  describe('findById', () => {
    it('returns area when found', async () => {
      serviceAreaRepo.findOne.mockResolvedValue(mockArea);
      const result = await serviceAreasService.findById('area-uuid-1');
      expect(result.id).toBe('area-uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      serviceAreaRepo.findOne.mockResolvedValue(null);
      await expect(serviceAreasService.findById('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates service area successfully and logs audit', async () => {
      serviceAreaRepo.findOne.mockResolvedValue(null);

      const result = await serviceAreasService.create(
        {
          provinceCode: '01',
          provinceName: 'Hà Nội',
          districtCode: '002',
          districtName: 'Quận Hoàn Kiếm',
        },
        mockActor,
      );

      expect(result.districtCode).toBe('002');
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resourceType: 'service_area',
        }),
      );
    });

    it('throws ConflictException when province and district already exist', async () => {
      serviceAreaRepo.findOne.mockResolvedValue(mockArea);

      await expect(
        serviceAreasService.create(
          {
            provinceCode: '01',
            provinceName: 'Hà Nội',
            districtCode: '001',
            districtName: 'Quận Ba Đình',
          },
          mockActor,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates service area and logs audit', async () => {
      serviceAreaRepo.findOne.mockResolvedValue(mockArea);

      const result = await serviceAreasService.update(
        'area-uuid-1',
        { districtName: 'Ba Đình Đổi Tên' },
        mockActor,
      );

      expect(result.districtName).toBe('Ba Đình Đổi Tên');
      expect(auditLogService.log).toHaveBeenCalled();
    });
  });

  describe('toggleStatus', () => {
    it('toggles isActive status and logs audit', async () => {
      serviceAreaRepo.findOne.mockResolvedValue({ ...mockArea, isActive: true });

      const result = await serviceAreasService.toggleStatus(
        'area-uuid-1',
        false,
        mockActor,
      );

      expect(result.isActive).toBe(false);
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DEACTIVATE' }),
      );
    });
  });
});
