// src/modules/categories/categories.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ServiceCategory } from './entities/category.entity';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let categoryRepository: any;

  const createMockCategory = (): ServiceCategory => ({
    id: 'cat-uuid-1',
    name: 'Điện lạnh',
    code: 'DIEN_LANH',
    slug: 'dien-lanh',
    iconKey: 'Snowflake',
    sortOrder: 1,
    description: 'Sửa điều hòa, máy giặt',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    services: [],
  });

  beforeEach(() => {
    categoryRepository = {
      find: vi.fn().mockResolvedValue([createMockCategory()]),
      findOne: vi.fn(),
      create: vi
        .fn()
        .mockImplementation((d) => ({ ...createMockCategory(), ...d })),
      save: vi.fn().mockImplementation((d) => Promise.resolve({ ...d })),
    };

    categoriesService = new CategoriesService(categoryRepository);
  });

  describe('findAll', () => {
    it('returns categories list', async () => {
      const result = await categoriesService.findAll(true);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('DIEN_LANH');
    });
  });

  describe('findById', () => {
    it('returns category when found', async () => {
      categoryRepository.findOne.mockResolvedValue(createMockCategory());

      const result = await categoriesService.findById('cat-uuid-1');
      expect(result.id).toBe('cat-uuid-1');
      expect(result.name).toBe('Điện lạnh');
    });

    it('throws NotFoundException when category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(categoriesService.findById('cat-unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates category successfully', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      const result = await categoriesService.create({
        name: 'Điện dân dụng',
        code: 'DIEN_DAN_DUNG',
      });

      expect(result.code).toBe('DIEN_DAN_DUNG');
    });

    it('throws ConflictException when code already exists', async () => {
      categoryRepository.findOne.mockResolvedValue(createMockCategory());

      await expect(
        categoriesService.create({
          name: 'Điện lạnh duplicate',
          code: 'DIEN_LANH',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('toggleStatus', () => {
    it('updates active status of category', async () => {
      categoryRepository.findOne.mockResolvedValue(createMockCategory());

      const result = await categoriesService.toggleStatus('cat-uuid-1', false);
      expect(result.isActive).toBe(false);
    });
  });
});
