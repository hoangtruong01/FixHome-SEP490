// src/modules/quotations/quotations.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { AdditionalCostRequest } from '../service-orders/entities/additional-cost-request.entity';
import { AdditionalCostItem } from '../service-orders/entities/additional-cost-item.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import {
  QuotationStatus,
  AdditionalCostStatus,
  CostItemType,
  Role,
  ServiceOrderStatus,
} from '../../shared/enums';
import { BusinessConfigService } from '../system-config/business-config.service';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface CreateCostItemDto {
  type: CostItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  warrantyDays?: number;
}

export interface CreateQuotationDto {
  items: CreateCostItemDto[];
  note?: string;
}

export interface CreateAdditionalCostDto {
  reason: string;
  items: CreateCostItemDto[];
}

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private readonly quotationItemRepo: Repository<QuotationItem>,
    @InjectRepository(AdditionalCostRequest)
    private readonly additionalCostRepo: Repository<AdditionalCostRequest>,
    @InjectRepository(AdditionalCostItem)
    private readonly additionalCostItemRepo: Repository<AdditionalCostItem>,
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    private readonly dataSource: DataSource,
    private readonly configService: BusinessConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ── 1. Quotations ──

  async createQuotation(
    orderId: string,
    dto: CreateQuotationDto,
    actor: { id: string; role: string },
  ): Promise<Quotation> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Service order ${orderId} not found`);
    }

    // Verify assigned technician
    const assignment = await this.assignmentRepo.findOne({
      where: { serviceOrderId: orderId, technicianId: actor.id, isActive: true },
    });
    if (!assignment && actor.role !== Role.ADMIN && actor.role !== Role.SERVICE_MANAGER) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Not assigned to this order');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BusinessException(ErrorCodes.VALIDATION_FAILED, 'Quotation must have at least one item');
    }

    let laborTotal = 0;
    let partsTotal = 0;

    for (const item of dto.items) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      if (item.type === CostItemType.LABOR) {
        laborTotal += lineTotal;
      } else {
        partsTotal += lineTotal;
      }
    }

    return this.dataSource.transaction(async (manager) => {
      const quotation = manager.create(Quotation, {
        serviceOrderId: orderId,
        technicianId: actor.id,
        status: QuotationStatus.SENT,
        laborTotal,
        partsTotal,
        note: dto.note || null,
        sentAt: new Date(),
      });
      const savedQuotation = await manager.save(quotation);

      const items = dto.items.map((item) =>
        manager.create(QuotationItem, {
          quotationId: savedQuotation.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: Number(item.quantity) * Number(item.unitPrice),
          warrantyDaysSnapshot: item.warrantyDays || 0,
        }),
      );
      savedQuotation.items = await manager.save(items);

      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'QUOTATION_CREATED',
        resourceType: 'quotation',
        resourceId: savedQuotation.id,
        after: { orderId, laborTotal, partsTotal, itemCount: items.length },
      });

      return savedQuotation;
    });
  }

  async findByOrderId(orderId: string): Promise<Quotation[]> {
    return this.quotationRepo.find({
      where: { serviceOrderId: orderId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!quotation) {
      throw new NotFoundException(`Quotation ${id} not found`);
    }
    return quotation;
  }

  async decideQuotation(
    quotationId: string,
    action: 'APPROVE' | 'REJECT',
    actor: { id: string; role: string },
  ): Promise<Quotation> {
    const quotation = await this.findById(quotationId);

    if (
      quotation.status === QuotationStatus.APPROVED ||
      quotation.status === QuotationStatus.REJECTED
    ) {
      throw new BusinessException(
        ErrorCodes.ADDITIONAL_COST_ALREADY_DECIDED,
        'Quotation has already been decided',
      );
    }

    const order = await this.orderRepo.findOneBy({ id: quotation.serviceOrderId });
    if (!order) {
      throw new NotFoundException(`Service order ${quotation.serviceOrderId} not found`);
    }

    // Check customer ownership
    const booking = await this.bookingRepo.findOneBy({ id: order.bookingId });
    if (
      booking &&
      booking.customerId !== actor.id &&
      actor.role !== Role.ADMIN &&
      actor.role !== Role.SERVICE_MANAGER
    ) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Not your booking');
    }

    return this.dataSource.transaction(async (manager) => {
      if (action === 'APPROVE') {
        quotation.status = QuotationStatus.APPROVED;
        quotation.decidedAt = new Date();

        // Update order totals
        order.laborTotal = quotation.laborTotal;
        order.partsTotal = quotation.partsTotal;
        order.grandTotal = Number(quotation.laborTotal) + Number(quotation.partsTotal);
        await manager.save(order);
      } else {
        quotation.status = QuotationStatus.REJECTED;
        quotation.decidedAt = new Date();
      }

      const saved = await manager.save(quotation);

      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: `QUOTATION_${action}D`,
        resourceType: 'quotation',
        resourceId: quotationId,
        after: { action, laborTotal: quotation.laborTotal, partsTotal: quotation.partsTotal },
      });

      return saved;
    });
  }

  // ── 2. Additional Costs ──

  async createAdditionalCost(
    orderId: string,
    dto: CreateAdditionalCostDto,
    actor: { id: string; role: string },
  ): Promise<AdditionalCostRequest> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Service order ${orderId} not found`);
    }

    if (order.status !== ServiceOrderStatus.UNDER_REPAIR) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Additional cost can only be requested while order is UNDER_REPAIR',
      );
    }

    let totalLaborDelta = 0;
    let totalPartsDelta = 0;

    for (const item of dto.items) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      if (item.type === CostItemType.LABOR) {
        totalLaborDelta += lineTotal;
      } else {
        totalPartsDelta += lineTotal;
      }
    }

    const ttlMinutes = await this.configService.getInt('additional_cost.ttl_minutes', 120);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    return this.dataSource.transaction(async (manager) => {
      const request = manager.create(AdditionalCostRequest, {
        serviceOrderId: orderId,
        technicianId: actor.id,
        status: AdditionalCostStatus.PENDING_APPROVAL,
        reason: dto.reason,
        totalLaborDelta,
        totalPartsDelta,
        expiresAt,
      });
      const savedRequest = await manager.save(request);

      const items = dto.items.map((item) =>
        manager.create(AdditionalCostItem, {
          requestId: savedRequest.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: Number(item.quantity) * Number(item.unitPrice),
          warrantyDaysSnapshot: item.warrantyDays || 0,
        }),
      );
      savedRequest.items = await manager.save(items);

      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'ADDITIONAL_COST_REQUESTED',
        resourceType: 'additional_cost_request',
        resourceId: savedRequest.id,
        after: { orderId, totalLaborDelta, totalPartsDelta },
      });

      return savedRequest;
    });
  }

  async findAdditionalCostsByOrderId(orderId: string): Promise<AdditionalCostRequest[]> {
    return this.additionalCostRepo.find({
      where: { serviceOrderId: orderId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async decideAdditionalCost(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    actor: { id: string; role: string },
  ): Promise<AdditionalCostRequest> {
    const request = await this.additionalCostRepo.findOne({
      where: { id: requestId },
      relations: ['items'],
    });
    if (!request) {
      throw new NotFoundException(`Additional cost request ${requestId} not found`);
    }

    if (
      request.status === AdditionalCostStatus.APPROVED ||
      request.status === AdditionalCostStatus.REJECTED
    ) {
      throw new BusinessException(
        ErrorCodes.ADDITIONAL_COST_ALREADY_DECIDED,
        'Additional cost has already been decided',
      );
    }

    if (request.expiresAt < new Date()) {
      request.status = AdditionalCostStatus.EXPIRED;
      await this.additionalCostRepo.save(request);
      throw new BusinessException(
        ErrorCodes.ADDITIONAL_COST_ALREADY_DECIDED,
        'Additional cost request has expired',
      );
    }

    const order = await this.orderRepo.findOneBy({ id: request.serviceOrderId });
    if (!order) {
      throw new NotFoundException(`Service order ${request.serviceOrderId} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      if (action === 'APPROVE') {
        request.status = AdditionalCostStatus.APPROVED;
        request.decidedAt = new Date();
        request.decidedByCustomerId = actor.id;

        // Apply deltas to order
        order.laborTotal = Number(order.laborTotal) + Number(request.totalLaborDelta);
        order.partsTotal = Number(order.partsTotal) + Number(request.totalPartsDelta);
        order.grandTotal = Number(order.laborTotal) + Number(order.partsTotal);
        await manager.save(order);
      } else {
        request.status = AdditionalCostStatus.REJECTED;
        request.decidedAt = new Date();
        request.decidedByCustomerId = actor.id;
      }

      const saved = await manager.save(request);

      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: `ADDITIONAL_COST_${action}D`,
        resourceType: 'additional_cost_request',
        resourceId: requestId,
        after: { action, newOrderGrandTotal: order.grandTotal },
      });

      return saved;
    });
  }

  /**
   * D-11: Revise additional cost — creates a NEW request with supersedesId.
   * Original record remains immutable.
   */
  async reviseAdditionalCost(
    requestId: string,
    dto: CreateAdditionalCostDto,
    actor: { id: string; role: string },
  ): Promise<AdditionalCostRequest> {
    const existing = await this.additionalCostRepo.findOneBy({ id: requestId });
    if (!existing) {
      throw new NotFoundException(`Additional cost request ${requestId} not found`);
    }

    if (existing.status === AdditionalCostStatus.APPROVED) {
      throw new BusinessException(
        ErrorCodes.ADDITIONAL_COST_IMMUTABLE,
        'Cannot revise an already approved additional cost (D-11)',
      );
    }

    const ttlMinutes = await this.configService.getInt('additional_cost.ttl_minutes', 120);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    let totalLaborDelta = 0;
    let totalPartsDelta = 0;

    for (const item of dto.items) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      if (item.type === CostItemType.LABOR) {
        totalLaborDelta += lineTotal;
      } else {
        totalPartsDelta += lineTotal;
      }
    }

    return this.dataSource.transaction(async (manager) => {
      // Mark old as superseded / cancelled
      existing.status = AdditionalCostStatus.REJECTED;
      await manager.save(existing);

      const revisedRequest = manager.create(AdditionalCostRequest, {
        serviceOrderId: existing.serviceOrderId,
        technicianId: actor.id,
        status: AdditionalCostStatus.PENDING_APPROVAL,
        reason: dto.reason,
        totalLaborDelta,
        totalPartsDelta,
        expiresAt,
        supersedesId: existing.id,
      });
      const saved = await manager.save(revisedRequest);

      const items = dto.items.map((item) =>
        manager.create(AdditionalCostItem, {
          requestId: saved.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: Number(item.quantity) * Number(item.unitPrice),
          warrantyDaysSnapshot: item.warrantyDays || 0,
        }),
      );
      saved.items = await manager.save(items);

      await this.auditLogService.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'ADDITIONAL_COST_REVISED',
        resourceType: 'additional_cost_request',
        resourceId: saved.id,
        after: { supersedesId: existing.id, totalLaborDelta, totalPartsDelta },
      });

      return saved;
    });
  }
}
