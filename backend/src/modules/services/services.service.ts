// src/modules/services/services.service.ts
import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceCategory } from '../categories/entities/category.entity';
import { CreateServiceDto, UpdateServiceDto, QueryServicesDto } from './dto';
import { PaginationMeta } from '../../shared/dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../users/entities/user.entity';
import { ServicePricingMode } from '../../shared/enums';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
    @Optional()
    private readonly auditLogService?: AuditLogService,
  ) {}

  async findServices(
    query: QueryServicesDto,
    onlyActive = false,
  ): Promise<{ data: Service[]; meta: PaginationMeta }> {
    const qb = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category');

    if (onlyActive) {
      qb.andWhere('service.isActive = true AND category.isActive = true');
    }

    if (query.categoryId) {
      qb.andWhere('service.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(service.name ILIKE :search OR service.code ILIKE :search OR service.slug ILIKE :search OR service.description ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('service.name', 'ASC');
    qb.skip(query.skip).take(query.limit);

    const [data, total] = await qb.getManyAndCount();

    const meta: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };

    return { data, meta };
  }

  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async findByIdOrSlug(idOrSlug: string, onlyActive = false): Promise<Service> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let service: Service | null = null;

    if (isUuid) {
      service = await this.serviceRepository.findOne({
        where: onlyActive ? { id: idOrSlug, isActive: true } : { id: idOrSlug },
        relations: ['category'],
      });
    } else {
      service = await this.serviceRepository.findOne({
        where: onlyActive ? { slug: idOrSlug, isActive: true } : { slug: idOrSlug },
        relations: ['category'],
      });
    }

    if (!service) {
      throw new NotFoundException(`Service "${idOrSlug}" not found`);
    }

    if (onlyActive && service.category && !service.category.isActive) {
      throw new NotFoundException(`Service "${idOrSlug}" belongs to an inactive category`);
    }

    return service;
  }

  async create(dto: CreateServiceDto, actor?: User): Promise<Service> {
    this.validatePrices(dto);
    const code = dto.code.trim().toUpperCase();

    // Check duplicate code
    const existing = await this.serviceRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Service code ${code} is already in use`);
    }

    if (dto.slug) {
      const existingSlug = await this.serviceRepository.findOne({
        where: { slug: dto.slug.trim() },
      });
      if (existingSlug) {
        throw new ConflictException(`Service slug ${dto.slug} is already in use`);
      }
    }

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} does not exist`,
      );
    }

    const service = this.serviceRepository.create({
      categoryId: dto.categoryId,
      name: dto.name.trim(),
      code,
      slug: dto.slug?.trim() || null,
      description: dto.description?.trim() || null,
      basePrice: dto.basePrice !== undefined ? dto.basePrice : null,
      minPrice: dto.minPrice !== undefined ? dto.minPrice : null,
      maxPrice: dto.maxPrice !== undefined ? dto.maxPrice : null,
      pricingMode: dto.pricingMode ?? ServicePricingMode.INSPECTION_REQUIRED,
      unit: dto.unit?.trim() || null,
      fixedPrice: dto.fixedPrice !== undefined ? dto.fixedPrice : null,
      scopeDescription: dto.scopeDescription?.trim() || null,
      estimatedMinutes: dto.estimatedMinutes ?? 60,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.serviceRepository.save(service);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'CREATE',
        resourceType: 'service',
        resourceId: saved.id,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    actor?: User,
  ): Promise<Service> {
    const service = await this.findById(id);
    const before = { ...service };

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} does not exist`,
        );
      }
      service.categoryId = dto.categoryId;
      service.category = category;
    }

    if (dto.name !== undefined) service.name = dto.name.trim();
    if (dto.slug !== undefined) {
      if (dto.slug && dto.slug !== service.slug) {
        const existingSlug = await this.serviceRepository.findOne({
          where: { slug: dto.slug.trim() },
        });
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException(`Service slug ${dto.slug} is already in use`);
        }
      }
      service.slug = dto.slug?.trim() || null;
    }
    if (dto.description !== undefined) {
      service.description = dto.description?.trim() || null;
    }
    if (dto.basePrice !== undefined) service.basePrice = dto.basePrice;
    if (dto.minPrice !== undefined) service.minPrice = dto.minPrice;
    if (dto.maxPrice !== undefined) service.maxPrice = dto.maxPrice;
    if (dto.pricingMode !== undefined) service.pricingMode = dto.pricingMode;
    if (dto.unit !== undefined) service.unit = dto.unit ? dto.unit.trim() : null;
    if (dto.fixedPrice !== undefined) service.fixedPrice = dto.fixedPrice;
    if (dto.scopeDescription !== undefined) {
      service.scopeDescription = dto.scopeDescription ? dto.scopeDescription.trim() : null;
    }
    if (dto.estimatedMinutes !== undefined) {
      service.estimatedMinutes = dto.estimatedMinutes;
    }
    if (dto.isActive !== undefined) service.isActive = dto.isActive;

    this.validatePrices(service);

    const saved = await this.serviceRepository.save(service);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'UPDATE',
        resourceType: 'service',
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
  ): Promise<Service> {
    const service = await this.findById(id);
    const before = { ...service };

    service.isActive = isActive;
    const saved = await this.serviceRepository.save(service);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        resourceType: 'service',
        resourceId: saved.id,
        before: before as unknown as Record<string, unknown>,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async findActiveById(id: string): Promise<Service> {
    const service = await this.findById(id);
    if (!service.isActive || !service.category?.isActive) {
      throw new NotFoundException('Active service not found');
    }
    return service;
  }

  private validatePrices(prices: {
    basePrice?: number;
    minPrice?: number;
    maxPrice?: number;
  }): void {
    for (const value of [prices.basePrice, prices.minPrice, prices.maxPrice]) {
      if (
        value != null &&
        (!Number.isFinite(Number(value)) ||
          Number(value) < 0 ||
          Number(value) > 9999999999.99)
      ) {
        throw new BadRequestException(
          'Price must be between 0 and 9999999999.99',
        );
      }
    }
    if (
      prices.minPrice != null &&
      prices.maxPrice != null &&
      Number(prices.minPrice) > Number(prices.maxPrice)
    ) {
      throw new BadRequestException('minPrice must not exceed maxPrice');
    }
  }
}
