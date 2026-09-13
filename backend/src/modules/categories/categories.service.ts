// src/modules/categories/categories.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
    @Optional()
    private readonly auditLogService?: AuditLogService,
  ) {}

  async findAll(onlyActive = true): Promise<ServiceCategory[]> {
    const where = onlyActive ? { isActive: true } : {};
    return this.categoryRepository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: ['services'],
    });
  }

  async findById(id: string, onlyActive = false): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: onlyActive ? { id, isActive: true } : { id },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException(`Service category with ID ${id} not found`);
    }

    if (onlyActive) {
      category.services = category.services.filter(
        (service) => service.isActive,
      );
    }
    return category;
  }

  async findByIdOrSlug(idOrSlug: string, onlyActive = false): Promise<ServiceCategory> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let category: ServiceCategory | null = null;

    if (isUuid) {
      category = await this.categoryRepository.findOne({
        where: onlyActive ? { id: idOrSlug, isActive: true } : { id: idOrSlug },
        relations: ['services'],
      });
    } else {
      category = await this.categoryRepository.findOne({
        where: onlyActive ? { slug: idOrSlug, isActive: true } : { slug: idOrSlug },
        relations: ['services'],
      });
    }

    if (!category) {
      throw new NotFoundException(`Service category "${idOrSlug}" not found`);
    }

    if (onlyActive && category.services) {
      category.services = category.services.filter((s) => s.isActive);
    }

    return category;
  }

  async create(dto: CreateCategoryDto, actor?: User): Promise<ServiceCategory> {
    const code = dto.code.trim().toUpperCase();

    const existingCode = await this.categoryRepository.findOne({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException(`Category code ${code} is already in use`);
    }

    if (dto.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: dto.slug.trim() },
      });
      if (existingSlug) {
        throw new ConflictException(`Category slug ${dto.slug} is already in use`);
      }
    }

    const category = this.categoryRepository.create({
      name: dto.name.trim(),
      code,
      slug: dto.slug?.trim() || null,
      iconKey: dto.iconKey?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      description: dto.description?.trim() || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.categoryRepository.save(category);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'CREATE',
        resourceType: 'service_category',
        resourceId: saved.id,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    actor?: User,
  ): Promise<ServiceCategory> {
    const category = await this.findById(id);
    const before = { ...category };

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
    }
    if (dto.slug !== undefined) {
      if (dto.slug && dto.slug !== category.slug) {
        const existingSlug = await this.categoryRepository.findOne({
          where: { slug: dto.slug.trim() },
        });
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(`Category slug ${dto.slug} is already in use`);
        }
      }
      category.slug = dto.slug?.trim() || null;
    }
    if (dto.iconKey !== undefined) {
      category.iconKey = dto.iconKey?.trim() || null;
    }
    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }
    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }
    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    const saved = await this.categoryRepository.save(category);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'UPDATE',
        resourceType: 'service_category',
        resourceId: saved.id,
        before: before as unknown as Record<string, unknown>,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async toggleStatus(
    id: string,
    isActive: boolean,
    actor?: User,
  ): Promise<ServiceCategory> {
    const category = await this.findById(id);
    const before = { ...category };

    category.isActive = isActive;
    const saved = await this.categoryRepository.save(category);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        resourceType: 'service_category',
        resourceId: saved.id,
        before: before as unknown as Record<string, unknown>,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }
}
