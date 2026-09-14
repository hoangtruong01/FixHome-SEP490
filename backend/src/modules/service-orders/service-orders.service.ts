// src/modules/service-orders/service-orders.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ServiceOrder } from './entities/service-order.entity';
import { TechnicianAssignment } from './entities/technician-assignment.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ArrivalCheckIn } from './entities/arrival-check-in.entity';
import { RepairEvidence } from './entities/repair-evidence.entity';
import { Cancellation } from './entities/cancellation.entity';
import { CancellationStrike } from './entities/cancellation-strike.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { WarrantyCoverage } from './entities/warranty-coverage.entity';
import { AdditionalCostRequest } from './entities/additional-cost-request.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { AdditionalCostItem } from './entities/additional-cost-item.entity';
import { CashSettlement } from './entities/cash-settlement.entity';
import { CommissionDue } from './entities/commission-due.entity';
import { WarrantyClaim } from './entities/warranty-claim.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import { ServiceOrderStateMachine } from './service-order-state-machine';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import {
  ServiceOrderStatus,
  CheckInResult,
  EvidenceType,
  CancelActor,
  CompensationStatus,
  StrikeStatus,
  PaymentStatus,
  QuotationStatus,
  AdditionalCostStatus,
  Role,
  CostItemType,
  WarrantyStatus,
  ServicePricingMode,
  CashSettlementStatus,
  CommissionDueStatus,
  WarrantyClaimStatus,
} from '../../shared/enums';
import { BusinessConfigService } from '../system-config/business-config.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { EntityManager } from 'typeorm';

@Injectable()
export class ServiceOrdersService {
  private readonly logger = new Logger(ServiceOrdersService.name);

  constructor(
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(OrderStatusHistory)
    private readonly historyRepo: Repository<OrderStatusHistory>,
    @InjectRepository(ArrivalCheckIn)
    private readonly checkInRepo: Repository<ArrivalCheckIn>,
    @InjectRepository(RepairEvidence)
    private readonly evidenceRepo: Repository<RepairEvidence>,
    @InjectRepository(Cancellation)
    private readonly cancellationRepo: Repository<Cancellation>,
    @InjectRepository(CancellationStrike)
    private readonly strikeRepo: Repository<CancellationStrike>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepo: Repository<InvoiceItem>,
    @InjectRepository(WarrantyCoverage)
    private readonly warrantyRepo: Repository<WarrantyCoverage>,
    @InjectRepository(AdditionalCostRequest)
    private readonly additionalCostRepo: Repository<AdditionalCostRequest>,
    @InjectRepository(CashSettlement)
    private readonly cashSettlementRepo: Repository<CashSettlement>,
    @InjectRepository(CommissionDue)
    private readonly commissionDueRepo: Repository<CommissionDue>,
    @InjectRepository(WarrantyClaim)
    private readonly warrantyClaimRepo: Repository<WarrantyClaim>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TechnicianProfile)
    private readonly techProfileRepo: Repository<TechnicianProfile>,
    private readonly dataSource: DataSource,
    private readonly configService: BusinessConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ── Queries ──

  async findAll(options: {
    page?: number;
    limit?: number;
    status?: ServiceOrderStatus;
    search?: string;
  }): Promise<{ data: ServiceOrder[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.orderRepo.createQueryBuilder('o');

    if (options.status) {
      qb.andWhere('o.status = :status', { status: options.status });
    }
    if (options.search) {
      qb.andWhere('o.code ILIKE :search', { search: `%${options.search}%` });
    }

    qb.orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findMyOrders(
    userId: string,
    role: string,
    options: { page?: number; limit?: number; status?: ServiceOrderStatus },
  ): Promise<{ data: ServiceOrder[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.orderRepo.createQueryBuilder('o');

    if (role === Role.CUSTOMER) {
      qb.innerJoin('bookings', 'b', 'b.id = o.booking_id')
        .where('b.customer_id = :userId', { userId });
    } else if (role === Role.TECHNICIAN) {
      qb.innerJoin(
        'technician_assignments',
        'ta',
        'ta.service_order_id = o.id AND ta.is_active = true',
      ).where('ta.technician_id = :userId', { userId });
    }

    if (options.status) {
      qb.andWhere('o.status = :status', { status: options.status });
    }

    qb.orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(
    id: string,
    actor: { id: string; role: string },
  ): Promise<ServiceOrder> {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Order not found');
    }
    await this.checkOrderAccess(order, actor);
    return order;
  }

  // ── State Transitions (D-22: all within transaction) ──

  /**
   * Transition to EN_ROUTE.
   */
  async enRoute(
    orderId: string,
    actor: { id: string; role: string },
  ): Promise<ServiceOrder> {
    return this.transitionStatus(
      orderId,
      ServiceOrderStatus.EN_ROUTE,
      actor,
      'Technician en route',
    );
  }

  /**
   * GPS check-in. Creates ArrivalCheckIn record.
   */
  async checkIn(
    orderId: string,
    body: { lat: number; lng: number; accuracyMeters: number; deviceInfo?: Record<string, unknown> },
    actor: { id: string; role: string },
  ): Promise<ArrivalCheckIn> {
    const order = await this.findById(orderId, actor);

    if (order.status !== ServiceOrderStatus.EN_ROUTE) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Order must be EN_ROUTE for check-in',
      );
    }

    const _geofenceRadius = await this.configService.getInt(
      'geofence.radius_meters',
      300,
    );
    const minAccuracy = await this.configService.getInt(
      'geofence.min_gps_accuracy_meters',
      100,
    );

    // Determine check-in result
    let result = CheckInResult.VALID;
    if (body.accuracyMeters > minAccuracy) {
      result = CheckInResult.LOW_ACCURACY;
    }
    // In production, compute distance from order address coordinates
    // For now, we trust the client-provided data but log it
    const distanceMeters = 0; // Would be computed from address lat/lng

    if (result === CheckInResult.LOW_ACCURACY) {
      // Still create the record but mark as low accuracy
    }

    const checkIn = this.checkInRepo.create({
      serviceOrderId: orderId,
      technicianId: actor.id,
      lat: body.lat,
      lng: body.lng,
      accuracyMeters: body.accuracyMeters,
      distanceMeters,
      result,
      checkedInAt: new Date(),
      deviceInfo: body.deviceInfo || null,
    });

    const saved = await this.checkInRepo.save(checkIn);

    if (result === CheckInResult.LOW_ACCURACY) {
      throw new BusinessException(
        ErrorCodes.CHECKIN_LOW_ACCURACY,
        'GPS accuracy is too low for check-in',
        { accuracyMeters: body.accuracyMeters, required: minAccuracy },
      );
    }

    return saved;
  }

  /**
   * Start repair — requires valid check-in + BEFORE evidence.
   */
  async startRepair(
    orderId: string,
    actor: { id: string; role: string },
  ): Promise<ServiceOrder> {
    const order = await this.findById(orderId, actor);

    if (order.status !== ServiceOrderStatus.EN_ROUTE) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Order must be EN_ROUTE to start repair',
      );
    }

    // Check valid check-in exists
    const validCheckIn = await this.checkInRepo.findOne({
      where: {
        serviceOrderId: orderId,
        technicianId: actor.id,
        result: CheckInResult.VALID,
      },
    });
    if (!validCheckIn) {
      throw new BusinessException(
        ErrorCodes.CHECKIN_OUT_OF_GEOFENCE,
        'Valid check-in required before starting repair',
      );
    }

    // D-07: Check BEFORE evidence
    const minBefore = await this.configService.getInt(
      'evidence.before.min_count',
      1,
    );
    const beforeCount = await this.evidenceRepo.count({
      where: { serviceOrderId: orderId, type: EvidenceType.BEFORE },
    });
    if (beforeCount < minBefore) {
      throw new BusinessException(
        ErrorCodes.EVIDENCE_REQUIRED_BEFORE,
        `At least ${minBefore} BEFORE evidence photo(s) required`,
        { required: minBefore, current: beforeCount },
      );
    }

    return this.transitionStatus(
      orderId,
      ServiceOrderStatus.UNDER_REPAIR,
      actor,
      'Repair started',
    );
  }

  /**
   * Complete order — requires AFTER evidence + no pending additional costs.
   * Generates invoice on completion.
   */
  async complete(
    orderId: string,
    body: { completionNote?: string },
    actor: { id: string; role: string },
  ): Promise<ServiceOrder> {
    const order = await this.findById(orderId, actor);

    if (order.status !== ServiceOrderStatus.UNDER_REPAIR) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Order must be UNDER_REPAIR to complete',
      );
    }

    // D-07: Check AFTER evidence
    const minAfter = await this.configService.getInt(
      'evidence.after.min_count',
      1,
    );
    const afterCount = await this.evidenceRepo.count({
      where: { serviceOrderId: orderId, type: EvidenceType.AFTER },
    });
    if (afterCount < minAfter) {
      throw new BusinessException(
        ErrorCodes.EVIDENCE_REQUIRED_AFTER,
        `At least ${minAfter} AFTER evidence photo(s) required`,
        { required: minAfter, current: afterCount },
      );
    }

    // Check no pending additional costs
    const pendingCosts = await this.additionalCostRepo.count({
      where: {
        serviceOrderId: orderId,
        status: AdditionalCostStatus.PENDING_APPROVAL,
      },
    });
    if (pendingCosts > 0) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'All additional costs must be decided before completion',
        { pendingCount: pendingCosts },
      );
    }

    // Complete in transaction: transition + generate invoice
    return this.dataSource.transaction(async (manager) => {
      // Transition status
      const now = new Date();
      await manager.update(ServiceOrder, orderId, {
        status: ServiceOrderStatus.COMPLETED,
        completedAt: now,
      });

      // D-22: Record history
      await manager.insert(OrderStatusHistory, {
        serviceOrderId: orderId,
        fromStatus: ServiceOrderStatus.UNDER_REPAIR,
        toStatus: ServiceOrderStatus.COMPLETED,
        actorUserId: actor.id,
        actorRole: actor.role,
        reason: body.completionNote || 'Order completed',
      });

      // Generate invoice
      await this.generateInvoice(orderId, manager);

      await this.auditLogService.logWithManager(manager, {
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'ORDER_COMPLETE',
        resourceType: 'service_order',
        resourceId: orderId,
      });

      return manager.findOneByOrFail(ServiceOrder, { id: orderId });
    });
  }

  /**
   * Cancel order with strike/compensation logic per P5.5.
   */
  async cancel(
    orderId: string,
    body: { reason: string },
    actor: { id: string; role: string },
  ): Promise<ServiceOrder> {
    const order = await this.findById(orderId, actor);

    if (
      order.status === ServiceOrderStatus.COMPLETED ||
      order.status === ServiceOrderStatus.CANCELLED
    ) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Cannot cancel a completed or already cancelled order',
      );
    }

    // Determine cancel actor type
    let cancelActorType: CancelActor;
    if (actor.role === Role.CUSTOMER) cancelActorType = CancelActor.CUSTOMER;
    else if (actor.role === Role.TECHNICIAN) cancelActorType = CancelActor.TECHNICIAN;
    else if (actor.role === Role.SERVICE_MANAGER) cancelActorType = CancelActor.SERVICE_MANAGER;
    else cancelActorType = CancelActor.ADMIN;

    return this.dataSource.transaction(async (manager) => {
      const stateAtCancel = order.status;
      const now = new Date();

      // Determine strike and compensation per P5.5
      let strikeApplied = false;
      let compensationStatus = CompensationStatus.NOT_ELIGIBLE;

      if (cancelActorType === CancelActor.CUSTOMER) {
        if (stateAtCancel === ServiceOrderStatus.ACCEPTED) {
          // Check grace period
          const graceMinutes = await this.configService.getInt(
            'cancel.grace_minutes_after_accept',
            15,
          );
          const assignment = await manager.findOne(TechnicianAssignment, {
            where: { serviceOrderId: orderId, isActive: true },
          });
          if (
            assignment &&
            now.getTime() - assignment.assignedAt.getTime() > graceMinutes * 60 * 1000
          ) {
            strikeApplied = true;
          }
        } else if (
          stateAtCancel === ServiceOrderStatus.EN_ROUTE ||
          stateAtCancel === ServiceOrderStatus.UNDER_REPAIR
        ) {
          strikeApplied = true;
          // Check if there's a valid arrival check-in per Spec v1.2 D-19 / BRX-034
          // (No monetary compensation; Customer +1 strike, Technician receives Priority Boost ranking signal)
          const validCheckIn = await manager.findOne(ArrivalCheckIn, {
            where: { serviceOrderId: orderId, result: CheckInResult.VALID },
          });
          if (validCheckIn) {
            compensationStatus = CompensationStatus.NOT_ELIGIBLE;
            const assignment = await manager.findOne(TechnicianAssignment, {
              where: { serviceOrderId: orderId, isActive: true },
            });
            if (assignment) {
              const boostDays = await this.configService.getInt('priority_boost.duration_days', 7);
              const boostUntil = new Date(now.getTime() + boostDays * 24 * 60 * 60 * 1000);
              await manager.update(TechnicianProfile, { userId: assignment.technicianId }, {
                priorityBoostUntil: boostUntil,
              });
            }
          }
        }
      } else if (cancelActorType === CancelActor.TECHNICIAN) {
        strikeApplied = true;
      }

      // Update order status
      await manager.update(ServiceOrder, orderId, {
        status: ServiceOrderStatus.CANCELLED,
        cancelledAt: now,
      });

      // D-22: Record history
      await manager.insert(OrderStatusHistory, {
        serviceOrderId: orderId,
        fromStatus: stateAtCancel,
        toStatus: ServiceOrderStatus.CANCELLED,
        actorUserId: actor.id,
        actorRole: actor.role,
        reason: body.reason,
      });

      // Create cancellation record
      const cancellation = manager.create(Cancellation, {
        serviceOrderId: orderId,
        actor: cancelActorType,
        actorUserId: actor.id,
        reason: body.reason,
        stateAtCancel,
        strikeApplied,
        compensationStatus,
      });
      const savedCancellation = await manager.save(Cancellation, cancellation);

      // Apply strike if needed
      if (strikeApplied) {
        const strikeWindowDays = await this.configService.getInt(
          'strike.window.days',
          30,
        );
        const expiresAt = new Date(
          now.getTime() + strikeWindowDays * 24 * 60 * 60 * 1000,
        );

        await manager.insert(CancellationStrike, {
          userId: actor.id,
          cancellationId: savedCancellation.id,
          role: actor.role,
          status: StrikeStatus.ACTIVE,
          expiresAt,
        });

        // Check threshold for suspension
        await this.checkStrikeThreshold(actor.id, actor.role, manager);
      }

      // Deactivate assignment
      await manager.update(
        TechnicianAssignment,
        { serviceOrderId: orderId, isActive: true },
        { isActive: false, unassignedAt: now, unassignReason: 'Order cancelled' },
      );

      await this.auditLogService.logWithManager(manager, {
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'ORDER_CANCEL',
        resourceType: 'service_order',
        resourceId: orderId,
        after: {
          stateAtCancel,
          strikeApplied,
          compensationStatus,
          reason: body.reason,
        },
      });

      return manager.findOneByOrFail(ServiceOrder, { id: orderId });
    });
  }

  /**
   * Upload evidence (BEFORE / AFTER / ADDITIONAL).
   */
  async uploadEvidence(
    orderId: string,
    body: { type: EvidenceType; mediaUrl: string; note?: string; capturedAt?: string },
    actor: { id: string; role: string },
  ): Promise<RepairEvidence> {
    await this.findById(orderId, actor);

    const evidence = this.evidenceRepo.create({
      serviceOrderId: orderId,
      uploaderId: actor.id,
      type: body.type,
      mediaUrl: body.mediaUrl,
      note: body.note || null,
      capturedAt: body.capturedAt ? new Date(body.capturedAt) : new Date(),
    });

    return this.evidenceRepo.save(evidence);
  }

  /**
   * Get status history for an order (D-22 audit trail).
   */
  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.historyRepo.find({
      where: { serviceOrderId: orderId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get invoice for an order.
   */
  async getInvoice(orderId: string): Promise<Invoice | null> {
    return this.invoiceRepo.findOne({
      where: { serviceOrderId: orderId },
      relations: ['items'],
    });
  }

  /**
   * Pay invoice (DEMO mode — just mark as PAID).
   */
  async payInvoice(
    invoiceId: string,
    _actor: { id: string; role: string },
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOneBy({ id: invoiceId });
    if (!invoice) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Invoice not found');
    }
    if (invoice.paymentStatus === PaymentStatus.PAID) {
      return invoice; // Idempotent
    }

    invoice.paymentStatus = PaymentStatus.PAID;
    invoice.paidAt = new Date();
    const saved = await this.invoiceRepo.save(invoice);

    // Also update order payment status
    await this.orderRepo.update(
      { id: invoice.serviceOrderId },
      { paymentStatus: PaymentStatus.PAID },
    );

    return saved;
  }

  /**
   * Get warranties for an order.
   */
  async getWarranties(orderId: string): Promise<WarrantyCoverage[]> {
    return this.warrantyRepo.find({
      where: { serviceOrderId: orderId },
      order: { expiresAt: 'ASC' },
    });
  }

  // ── Spec v1.2: Cash Settlement & Commission Tracking ──

  async declareCashSettlement(
    orderId: string,
    dto: { declaredAmount: number; technicianNotes?: string; receiptEvidenceUrl?: string },
    actor: { id: string; role: string },
  ): Promise<CashSettlement> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Service order not found');
    }

    // Verify actor is assigned technician
    const assignment = await this.assignmentRepo.findOne({
      where: { serviceOrderId: orderId, technicianId: actor.id, isActive: true },
    });
    if (!assignment && actor.role !== Role.ADMIN) {
      throw new BusinessException(
        ErrorCodes.OWNERSHIP_DENIED,
        'Only assigned technician can declare cash received',
      );
    }
    if (order.status !== ServiceOrderStatus.COMPLETED) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Order must be completed before settling cash payment',
      );
    }

    let settlement = await this.cashSettlementRepo.findOne({
      where: { serviceOrderId: orderId },
    });
    if (settlement && settlement.status === CashSettlementStatus.CONFIRMED) {
      throw new BusinessException(
        ErrorCodes.CONFLICT,
        'Cash settlement is already confirmed',
      );
    }

    if (!settlement) {
      settlement = this.cashSettlementRepo.create({
        serviceOrderId: orderId,
        declaredByTechnicianId: actor.id,
      });
    }

    settlement.declaredAmount = dto.declaredAmount;
    settlement.declaredAt = new Date();
    settlement.technicianNotes = dto.technicianNotes || null;
    settlement.receiptEvidenceUrl = dto.receiptEvidenceUrl || null;
    settlement.status = CashSettlementStatus.PENDING_CONFIRMATION;

    return this.cashSettlementRepo.save(settlement);
  }

  async confirmCashSettlement(
    orderId: string,
    dto: { agreed: boolean; disputeReason?: string; confirmedAmount?: number },
    actor: { id: string; role: string },
  ): Promise<CashSettlement> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Service order not found');
    }

    const booking = await this.dataSource
      .getRepository(Booking)
      .findOneBy({ id: order.bookingId });
    if (
      booking?.customerId !== actor.id &&
      actor.role !== Role.ADMIN &&
      actor.role !== Role.SERVICE_MANAGER
    ) {
      throw new BusinessException(
        ErrorCodes.OWNERSHIP_DENIED,
        'Only customer can confirm cash payment',
      );
    }

    const settlement = await this.cashSettlementRepo.findOne({
      where: { serviceOrderId: orderId },
    });
    if (!settlement) {
      throw new BusinessException(
        ErrorCodes.NOT_FOUND,
        'No cash settlement declaration found for this order',
      );
    }

    if (dto.agreed) {
      settlement.status = CashSettlementStatus.CONFIRMED;
      settlement.confirmedByCustomerId = actor.id;
      settlement.confirmedAmount =
        dto.confirmedAmount ?? settlement.declaredAmount;
      settlement.confirmedAt = new Date();
      const savedSettlement = await this.cashSettlementRepo.save(settlement);

      // Mark invoice and order as PAID
      const invoice = await this.invoiceRepo.findOne({
        where: { serviceOrderId: orderId },
      });
      if (invoice) {
        invoice.paymentStatus = PaymentStatus.PAID;
        invoice.paidAt = new Date();
        await this.invoiceRepo.save(invoice);
      }
      await this.orderRepo.update(
        { id: orderId },
        { paymentStatus: PaymentStatus.PAID },
      );

      // Create CommissionDue (10% on Labor Total)
      const assignment = await this.assignmentRepo.findOne({
        where: { serviceOrderId: orderId, isActive: true },
      });
      const technicianId = assignment?.technicianId || settlement.declaredByTechnicianId;
      const laborTotal = invoice
        ? Number(invoice.laborTotal)
        : Number(order.laborTotal || 0);
      const dueAmount = invoice?.commissionAmount
        ? Number(invoice.commissionAmount)
        : Math.round(laborTotal * 0.1);

      if (technicianId && dueAmount > 0) {
        const existingDue = await this.commissionDueRepo.findOne({
          where: { serviceOrderId: orderId },
        });
        if (!existingDue) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7); // 7-day payment window

          const commissionDue = this.commissionDueRepo.create({
            technicianId,
            serviceOrderId: orderId,
            cashSettlementId: savedSettlement.id,
            laborTotalSnapshot: laborTotal,
            commissionRateSnapshot: 0.1,
            dueAmount,
            status: CommissionDueStatus.PENDING,
            dueDate,
          });
          await this.commissionDueRepo.save(commissionDue);
        }
      }

      return savedSettlement;
    } else {
      settlement.status = CashSettlementStatus.DISPUTED;
      settlement.managerResolutionReason =
        dto.disputeReason || 'Customer disputed declared cash amount';
      return this.cashSettlementRepo.save(settlement);
    }
  }

  async getCashSettlement(orderId: string): Promise<CashSettlement | null> {
    return this.cashSettlementRepo.findOne({
      where: { serviceOrderId: orderId },
      relations: ['declaredByTechnician', 'confirmedByCustomer'],
    });
  }

  async getCommissionDues(
    technicianId: string,
  ): Promise<{ data: CommissionDue[]; totalDue: number }> {
    const dues = await this.commissionDueRepo.find({
      where: { technicianId },
      relations: ['serviceOrder'],
      order: { createdAt: 'DESC' },
    });
    const totalDue = dues
      .filter((d) => d.status === CommissionDueStatus.PENDING)
      .reduce((sum, d) => sum + Number(d.dueAmount), 0);
    return { data: dues, totalDue };
  }

  async payCommissionDue(
    dueId: string,
    technicianId: string,
  ): Promise<CommissionDue> {
    const due = await this.commissionDueRepo.findOne({
      where: { id: dueId, technicianId },
    });
    if (!due) {
      throw new BusinessException(
        ErrorCodes.NOT_FOUND,
        'Commission due record not found',
      );
    }
    if (due.status === CommissionDueStatus.PAID) {
      return due;
    }
    due.status = CommissionDueStatus.PAID;
    due.paidAt = new Date();
    return this.commissionDueRepo.save(due);
  }

  async createWarrantyClaim(
    orderId: string,
    dto: { description: string },
    customer: { id: string },
  ): Promise<WarrantyClaim> {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Service order not found');
    }
    const booking = await this.dataSource
      .getRepository(Booking)
      .findOneBy({ id: order.bookingId });
    if (booking?.customerId !== customer.id) {
      throw new BusinessException(
        ErrorCodes.OWNERSHIP_DENIED,
        'Only customer can submit warranty claim',
      );
    }

    const assignment = await this.assignmentRepo.findOne({
      where: { serviceOrderId: orderId, isActive: true },
    });

    const claim = this.warrantyClaimRepo.create({
      serviceOrderId: orderId,
      customerId: customer.id,
      technicianId: assignment?.technicianId || '',
      description: dto.description,
      status: WarrantyClaimStatus.SUBMITTED,
    });
    return this.warrantyClaimRepo.save(claim);
  }

  async getWarrantyClaims(orderId: string): Promise<WarrantyClaim[]> {
    return this.warrantyClaimRepo.find({
      where: { serviceOrderId: orderId },
      relations: ['customer', 'technician'],
      order: { submittedAt: 'DESC' },
    });
  }

  /**
   * Get cancellations for SM/Admin board.
   */
  async getCancellations(options: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Cancellation[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const [data, total] = await this.cancellationRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  /**
   * Review cancellation — waive strike, decide compensation.
   */
  async reviewCancellation(
    cancellationId: string,
    body: {
      waiveStrike?: boolean;
      waiveReason?: string;
      compensationDecision?: 'GRANTED' | 'REJECTED';
      grantPriorityBoost?: boolean;
    },
    actor: { id: string; role: string },
  ): Promise<Cancellation> {
    const cancellation = await this.cancellationRepo.findOneBy({
      id: cancellationId,
    });
    if (!cancellation) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Cancellation not found');
    }

    cancellation.reviewedByUserId = actor.id;

    if (body.compensationDecision) {
      cancellation.compensationStatus =
        body.compensationDecision === 'GRANTED'
          ? CompensationStatus.GRANTED
          : CompensationStatus.REJECTED;
    }

    // Spec v1.2: Grant Priority Boost to technician if requested
    if (body.grantPriorityBoost) {
      const assignment = await this.assignmentRepo.findOne({
        where: { serviceOrderId: cancellation.serviceOrderId },
        order: { createdAt: 'DESC' },
      });
      if (assignment) {
        const boostDays = await this.configService.getInt('priority_boost.duration_days', 7);
        const boostUntil = new Date(Date.now() + boostDays * 24 * 60 * 60 * 1000);
        await this.techProfileRepo.update(
          { userId: assignment.technicianId },
          { priorityBoostUntil: boostUntil },
        );
      }
    }

    if (body.waiveStrike && cancellation.strikeApplied) {
      // Waive the strike
      const strike = await this.strikeRepo.findOne({
        where: { cancellationId: cancellation.id, status: StrikeStatus.ACTIVE },
      });
      if (strike) {
        strike.status = StrikeStatus.WAIVED;
        strike.waivedByUserId = actor.id;
        strike.waiveReason = body.waiveReason || 'Waived by manager';
        await this.strikeRepo.save(strike);
      }
    }

    const saved = await this.cancellationRepo.save(cancellation);

    await this.auditLogService.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'CANCELLATION_REVIEW',
      resourceType: 'cancellation',
      resourceId: cancellationId,
      after: body,
    });

    return saved;
  }

  /**
   * Get strikes for a user.
   */
  async getStrikes(options: {
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CancellationStrike[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.strikeRepo.createQueryBuilder('s');
    if (options.userId) {
      qb.where('s.userId = :userId', { userId: options.userId });
    }

    qb.orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Waive a strike.
   */
  async waiveStrike(
    strikeId: string,
    body: { reason: string },
    actor: { id: string; role: string },
  ): Promise<CancellationStrike> {
    const strike = await this.strikeRepo.findOneBy({ id: strikeId });
    if (!strike) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Strike not found');
    }

    strike.status = StrikeStatus.WAIVED;
    strike.waivedByUserId = actor.id;
    strike.waiveReason = body.reason;

    const saved = await this.strikeRepo.save(strike);

    await this.auditLogService.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'STRIKE_WAIVE',
      resourceType: 'cancellation_strike',
      resourceId: strikeId,
      after: { reason: body.reason },
    });

    return saved;
  }

  /**
   * D-20: Repair history — read model derived from service_orders + invoices + reviews.
   * NO separate table.
   */
  async getRepairHistory(
    userId: string,
    role: string,
    options: { page?: number; limit?: number },
  ): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('bookings', 'b', 'b.id = o.booking_id')
      .leftJoinAndSelect('services', 's', 's.id = b.service_id')
      .where('o.status = :completed', {
        completed: ServiceOrderStatus.COMPLETED,
      });

    if (role === Role.CUSTOMER) {
      qb.andWhere('b.customer_id = :userId', { userId });
    } else if (role === Role.TECHNICIAN) {
      qb.innerJoin(
        'technician_assignments',
        'ta',
        'ta.service_order_id = o.id',
      ).andWhere('ta.technician_id = :userId', { userId });
    }

    qb.orderBy('o.completedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Return as plain objects matching the read model
    const result = data.map((order) => ({
      orderId: order.id,
      code: order.code,
      laborTotal: Number(order.laborTotal),
      partsTotal: Number(order.partsTotal),
      grandTotal: Number(order.grandTotal),
      completedAt: order.completedAt,
    }));

    return { data: result, total };
  }

  // ── Private helpers ──

  /**
   * D-22: Central method for state transitions within a transaction.
   */
  private async transitionStatus(
    orderId: string,
    nextStatus: ServiceOrderStatus,
    actor: { id: string; role: string },
    reason?: string,
  ): Promise<ServiceOrder> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOneByOrFail(ServiceOrder, {
        id: orderId,
      });

      if (
        !ServiceOrderStateMachine.canTransition(
          order.status,
          nextStatus,
          actor.role as Role,
        )
      ) {
        throw new BusinessException(
          ErrorCodes.ORDER_INVALID_TRANSITION,
          `Cannot transition from ${order.status} to ${nextStatus}`,
          { from: order.status, to: nextStatus },
        );
      }

      const fromStatus = order.status;

      // Update status
      const updates: Partial<ServiceOrder> = { status: nextStatus };
      if (nextStatus === ServiceOrderStatus.EN_ROUTE) {
        // No extra fields
      } else if (nextStatus === ServiceOrderStatus.UNDER_REPAIR) {
        updates.startedAt = new Date();
      }

      await manager.update(ServiceOrder, orderId, updates);

      // D-22: Record history in same transaction
      await manager.insert(OrderStatusHistory, {
        serviceOrderId: orderId,
        fromStatus,
        toStatus: nextStatus,
        actorUserId: actor.id,
        actorRole: actor.role,
        reason: reason || null,
      });

      await this.auditLogService.logWithManager(manager, {
        actorUserId: actor.id,
        actorRole: actor.role,
        action: `ORDER_TRANSITION_${nextStatus.toUpperCase()}`,
        resourceType: 'service_order',
        resourceId: orderId,
        before: { status: fromStatus },
        after: { status: nextStatus },
      });

      return manager.findOneByOrFail(ServiceOrder, { id: orderId });
    });
  }

  /**
   * Generate invoice from fixed price or quotation items + additional costs.
   */
  private async generateInvoice(
    orderId: string,
    manager: EntityManager,
  ): Promise<Invoice> {
    const order = await manager.findOne(ServiceOrder, {
      where: { id: orderId },
    });

    const booking = order
      ? await manager.findOne(Booking, {
          where: { id: order.bookingId },
          relations: ['service'],
        })
      : null;

    // Get approved quotation (if any)
    const quotation = await manager.findOne(Quotation, {
      where: { serviceOrderId: orderId, status: QuotationStatus.APPROVED },
      relations: ['items'],
    });

    // Get approved additional costs
    const additionalCosts = await manager.find(AdditionalCostRequest, {
      where: {
        serviceOrderId: orderId,
        status: AdditionalCostStatus.APPROVED,
      },
    });
    const additionalCostIds = additionalCosts.map((ac) => ac.id);
    let additionalItems: AdditionalCostItem[] = [];
    if (additionalCostIds.length > 0) {
      additionalItems = await manager
        .createQueryBuilder(AdditionalCostItem, 'aci')
        .where('aci.request_id IN (:...ids)', { ids: additionalCostIds })
        .getMany();
    }

    // Calculate totals
    let laborTotal = 0;
    let partsTotal = 0;

    const invoiceItems: Partial<InvoiceItem>[] = [];

    // 1. Check if FIXED_PRICE booking
    const isFixedPrice =
      booking?.pricingModeSnapshot === ServicePricingMode.FIXED_PRICE ||
      (!quotation && booking?.fixedUnitPriceSnapshot != null);

    if (isFixedPrice && booking) {
      const unitPrice = Number(
        booking.fixedUnitPriceSnapshot ||
          booking.service?.fixedPrice ||
          booking.service?.basePrice ||
          0,
      );
      const quantity = Math.max(1, Number(booking.quantity || 1));
      const lineTotal = unitPrice * quantity;
      laborTotal += lineTotal;

      invoiceItems.push({
        sourceType: 'FIXED_PRICE',
        sourceItemId: booking.id,
        type: CostItemType.LABOR,
        description:
          booking.scopeSnapshot ||
          booking.service?.name ||
          'Fixed Price Labor Package',
        quantity,
        unitPrice,
        lineTotal,
        warrantyDaysSnapshot: 30,
      });
    } else if (quotation?.items) {
      // 2. Inspection-based quotation items
      for (const qi of quotation.items) {
        const lineTotal = Number(qi.lineTotal);
        if (qi.type === CostItemType.LABOR) laborTotal += lineTotal;
        else partsTotal += lineTotal;

        invoiceItems.push({
          sourceType: 'QUOTATION',
          sourceItemId: qi.id,
          type: qi.type,
          description: qi.description,
          quantity: qi.quantity,
          unitPrice: Number(qi.unitPrice),
          lineTotal,
          warrantyDaysSnapshot: qi.warrantyDaysSnapshot,
        });
      }
    }

    // 3. Approved Additional cost items
    for (const aci of additionalItems) {
      const lineTotal = Number(aci.lineTotal);
      if (aci.type === CostItemType.LABOR) laborTotal += lineTotal;
      else partsTotal += lineTotal;

      invoiceItems.push({
        sourceType: 'ADDITIONAL',
        sourceItemId: aci.id,
        type: aci.type,
        description: aci.description,
        quantity: aci.quantity,
        unitPrice: Number(aci.unitPrice),
        lineTotal,
        warrantyDaysSnapshot: aci.warrantyDays,
      });
    }

    const grandTotal = laborTotal + partsTotal;

    // Spec v1.2: Platform commission is 10% on Final Labor Total. 0% on parts.
    const commissionBase = 'LABOR';
    const commissionAmount = Math.round(laborTotal * 0.1);

    // Create invoice
    const invoice = manager.create(Invoice, {
      serviceOrderId: orderId,
      laborTotal,
      partsTotal,
      grandTotal,
      commissionBase,
      commissionAmount,
      paymentStatus: PaymentStatus.UNPAID,
      issuedAt: new Date(),
    });
    const savedInvoice = await manager.save(Invoice, invoice);

    // Create invoice items
    for (const item of invoiceItems) {
      item.invoiceId = savedInvoice.id;
      await manager.insert(InvoiceItem, item);

      // Create warranty coverages for items with warranty
      if (item.warrantyDaysSnapshot && item.warrantyDaysSnapshot > 0) {
        const startsAt = new Date();
        const expiresAt = new Date(
          startsAt.getTime() +
            item.warrantyDaysSnapshot * 24 * 60 * 60 * 1000,
        );
        await manager.insert(WarrantyCoverage, {
          serviceOrderId: orderId,
          invoiceItemId: undefined,
          warrantyDaysSnapshot: item.warrantyDaysSnapshot,
          startsAt,
          expiresAt,
          status: WarrantyStatus.ACTIVE,
        });
      }
    }

    // Update order totals
    await manager.update(ServiceOrder, orderId, {
      laborTotal,
      partsTotal,
      grandTotal,
    });

    return savedInvoice;
  }

  /**
   * Check if user has exceeded strike threshold → apply suspension.
   */
  private async checkStrikeThreshold(
    userId: string,
    role: string,
    manager: EntityManager,
  ): Promise<void> {
    const thresholdKey =
      role === Role.CUSTOMER
        ? 'strike.customer.threshold'
        : 'strike.technician.threshold';
    const suspensionKey =
      role === Role.CUSTOMER
        ? 'customer.suspension.hours'
        : 'technician.suspension.hours';

    const threshold = await this.configService.getInt(thresholdKey, 2);
    const suspensionHours = await this.configService.getInt(suspensionKey, 72);

    const activeStrikes = await manager.count(CancellationStrike, {
      where: { userId, status: StrikeStatus.ACTIVE },
    });

    if (activeStrikes >= threshold) {
      const suspendedUntil = new Date(
        Date.now() + suspensionHours * 60 * 60 * 1000,
      );

      if (role === Role.CUSTOMER) {
        await manager.update(User, userId, {
          bookingSuspendedUntil: suspendedUntil,
        });
      } else if (role === Role.TECHNICIAN) {
        await manager.update(
          TechnicianProfile,
          { userId },
          { workSuspendedUntil: suspendedUntil },
        );
      }

      this.logger.warn(
        `User ${userId} suspended until ${suspendedUntil.toISOString()} (${activeStrikes} active strikes)`,
      );
    }
  }

  /**
   * Check if an actor has access to a specific order.
   */
  private async checkOrderAccess(
    order: ServiceOrder,
    actor: { id: string; role: string },
  ): Promise<void> {
    if (
      actor.role === Role.ADMIN ||
      actor.role === Role.SERVICE_MANAGER
    ) {
      return;
    }

    // Check customer ownership via booking
    const booking = await this.dataSource
      .getRepository('bookings')
      .findOneBy({ id: order.bookingId });

    if (booking && (booking as { customer_id: string }).customer_id === actor.id) {
      return;
    }

    // Check technician assignment
    const assignment = await this.assignmentRepo.findOne({
      where: { serviceOrderId: order.id, technicianId: actor.id, isActive: true },
    });
    if (assignment) return;

    throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Order not found');
  }
}
