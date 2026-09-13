// src/modules/service-areas/service-areas.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceArea } from './entities/service-area.entity';
import { CreateServiceAreaDto, QueryServiceAreaDto, UpdateServiceAreaDto } from './dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ServiceAreasService {
  constructor(
    @InjectRepository(ServiceArea)
    private readonly serviceAreaRepo: Repository<ServiceArea>,
    @Optional()
    private readonly auditLogService?: AuditLogService,
  ) {}

  async findAll(query?: QueryServiceAreaDto): Promise<ServiceArea[]> {
    const qb = this.serviceAreaRepo.createQueryBuilder('sa');

    if (query?.provinceCode) {
      qb.andWhere('sa.provinceCode = :provinceCode', {
        provinceCode: query.provinceCode,
      });
    }

    if (query?.isActive !== undefined) {
      qb.andWhere('sa.isActive = :isActive', { isActive: query.isActive });
    }

    qb.orderBy('sa.provinceCode', 'ASC')
      .addOrderBy('sa.districtName', 'ASC');

    return qb.getMany();
  }

  async findById(id: string): Promise<ServiceArea> {
    const area = await this.serviceAreaRepo.findOne({ where: { id } });
    if (!area) {
      throw new NotFoundException(`Service area with ID ${id} not found`);
    }
    return area;
  }

  async create(dto: CreateServiceAreaDto, actor?: User): Promise<ServiceArea> {
    const existing = await this.serviceAreaRepo.findOne({
      where: {
        provinceCode: dto.provinceCode,
        districtCode: dto.districtCode,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Service area for province ${dto.provinceCode} and district ${dto.districtCode} already exists`,
      );
    }

    const area = this.serviceAreaRepo.create({
      provinceCode: dto.provinceCode,
      provinceName: dto.provinceName,
      districtCode: dto.districtCode,
      districtName: dto.districtName,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.serviceAreaRepo.save(area);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'CREATE',
        resourceType: 'service_area',
        resourceId: saved.id,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }

  async update(
    id: string,
    dto: UpdateServiceAreaDto,
    actor?: User,
  ): Promise<ServiceArea> {
    const area = await this.findById(id);
    const before = { ...area };

    if (
      dto.provinceCode &&
      dto.districtCode &&
      (dto.provinceCode !== area.provinceCode || dto.districtCode !== area.districtCode)
    ) {
      const existing = await this.serviceAreaRepo.findOne({
        where: {
          provinceCode: dto.provinceCode,
          districtCode: dto.districtCode,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Service area for province ${dto.provinceCode} and district ${dto.districtCode} already exists`,
        );
      }
    }

    Object.assign(area, dto);
    const saved = await this.serviceAreaRepo.save(area);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'UPDATE',
        resourceType: 'service_area',
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
  ): Promise<ServiceArea> {
    const area = await this.findById(id);
    const before = { ...area };

    area.isActive = isActive;
    const saved = await this.serviceAreaRepo.save(area);

    if (this.auditLogService && actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
        resourceType: 'service_area',
        resourceId: saved.id,
        before: before as unknown as Record<string, unknown>,
        after: saved as unknown as Record<string, unknown>,
      });
    }

    return saved;
  }
}
