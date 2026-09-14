// src/modules/bookings/invitations.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookingInvitation } from './entities/booking-invitation.entity';
import { Booking } from './entities/booking.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { OrderStatusHistory } from '../service-orders/entities/order-status-history.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import {
  InvitationStatus,
  BookingStatus,
  ServiceOrderStatus,
} from '../../shared/enums';
import { BusinessConfigService } from '../system-config/business-config.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectRepository(BookingInvitation)
    private readonly invitationRepo: Repository<BookingInvitation>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly dataSource: DataSource,
    private readonly configService: BusinessConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create shortlist — send invitations to ≤ 5 technicians.
   * P4.5: POST /bookings/:id/shortlist
   */
  async createShortlist(
    bookingId: string,
    technicianIds: string[],
    customer: { id: string; role: string },
  ): Promise<BookingInvitation[]> {
    const maxShortlist = await this.configService.getInt(
      'matching.max_shortlist',
      5,
    );

    if (technicianIds.length > maxShortlist) {
      throw new BusinessException(
        ErrorCodes.SHORTLIST_LIMIT_EXCEEDED,
        `Maximum ${maxShortlist} candidates allowed`,
        { max: maxShortlist, requested: technicianIds.length },
      );
    }

    const booking = await this.bookingRepo.findOneBy({
      id: bookingId,
      customerId: customer.id,
    });
    if (!booking) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Booking not found');
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.MATCHING
    ) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Booking is not in a valid state for shortlisting',
      );
    }

    // Check for existing invitations
    const existingCount = await this.invitationRepo.count({
      where: { bookingId },
    });
    if (existingCount > 0) {
      throw new BusinessException(
        ErrorCodes.CONFLICT,
        'Invitations already exist for this booking',
      );
    }

    const ttlMinutes = await this.configService.getInt(
      'matching.invitation_ttl_minutes',
      30,
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const invitations: BookingInvitation[] = [];
    for (let i = 0; i < technicianIds.length; i++) {
      const isFirst = i === 0;
      const invitation = this.invitationRepo.create({
        bookingId,
        technicianId: technicianIds[i],
        priorityOrder: i + 1,
        status: isFirst ? InvitationStatus.PENDING : InvitationStatus.STANDBY,
        invitedAt: new Date(),
        expiresAt: isFirst ? expiresAt : null,
      });
      invitations.push(invitation);
    }

    const saved = await this.invitationRepo.save(invitations);

    // Update booking status to MATCHING
    await this.bookingRepo.update(bookingId, {
      status: BookingStatus.MATCHING,
    });

    await this.auditLogService.log({
      actorUserId: customer.id,
      actorRole: customer.role,
      action: 'SHORTLIST_CREATE',
      resourceType: 'booking',
      resourceId: bookingId,
      after: { technicianIds, ttlMinutes },
    });

    return saved;
  }

  /**
   * Get pending invitations for a technician (inbox).
   * P4.5: GET /invitations/my
   */
  async getMyInvitations(
    technicianId: string,
  ): Promise<BookingInvitation[]> {
    return this.invitationRepo.find({
      where: {
        technicianId,
        status: InvitationStatus.PENDING,
      },
      relations: ['booking'],
      order: { invitedAt: 'DESC' },
    });
  }

  /**
   * Respond to an invitation — ACCEPT or DECLINE.
   * P4.5 / D-04: CRITICAL atomic transaction for ACCEPT.
   *
   * Transaction flow for ACCEPT:
   * 1. Lock booking FOR UPDATE
   * 2. Check no active assignment exists
   * 3. Create ServiceOrder with status ACCEPTED
   * 4. Create TechnicianAssignment with isActive=true
   * 5. Set remaining invitations to EXPIRED
   * 6. Insert OrderStatusHistory (D-22)
   * 7. Race loser gets INVITATION_ALREADY_TAKEN
   */
  async respond(
    invitationId: string,
    action: 'ACCEPT' | 'DECLINE',
    technician: { id: string; role: string },
  ): Promise<{
    invitation: BookingInvitation;
    serviceOrder?: ServiceOrder;
  }> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, technicianId: technician.id },
      relations: ['booking'],
    });

    if (!invitation) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Invitation is no longer pending',
      );
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      invitation.respondedAt = new Date();
      await this.invitationRepo.save(invitation);
      await this.inviteNextCandidate(invitation.bookingId);
      throw new BusinessException(
        ErrorCodes.INVITATION_EXPIRED,
        'Invitation has expired',
      );
    }

    if (action === 'DECLINE') {
      invitation.status = InvitationStatus.DECLINED;
      invitation.respondedAt = new Date();
      await this.invitationRepo.save(invitation);
      await this.inviteNextCandidate(invitation.bookingId);
      return { invitation };
    }

    // Check overdue commission debt (Spec v1.2 rule: blocked from new jobs if overdue)
    const overdueCount = await this.dataSource
      .getRepository('commission_dues')
      .createQueryBuilder('cd')
      .where('cd.technician_id = :techId', { techId: technician.id })
      .andWhere('cd.status = :status', { status: 'pending' })
      .andWhere('cd.due_date < :now', { now: new Date() })
      .getCount();

    if (overdueCount > 0) {
      throw new BusinessException(
        ErrorCodes.WORK_SUSPENDED,
        'Technician has overdue platform commission debt. Please clear dues before accepting new jobs.',
      );
    }

    // ── ACCEPT — atomic transaction ──
    return this.dataSource.transaction(async (manager) => {
      // 1. Lock booking row FOR UPDATE to prevent race condition
      const booking = await manager
        .createQueryBuilder(Booking, 'b')
        .setLock('pessimistic_write')
        .where('b.id = :id', { id: invitation.bookingId })
        .getOne();

      if (!booking) {
        throw new BusinessException(ErrorCodes.NOT_FOUND, 'Booking not found');
      }

      // 2. Check if booking already has a matched order (race protection)
      const existingOrder = await manager.findOne(ServiceOrder, {
        where: { bookingId: booking.id },
      });
      if (existingOrder) {
        throw new BusinessException(
          ErrorCodes.INVITATION_ALREADY_TAKEN,
          'Another technician has already accepted this booking',
        );
      }

      // 3. Generate order code: FH-YYYYMMDD-XXXX
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const orderCount = await manager.count(ServiceOrder);
      const code = `FH-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`;

      // 4. Create ServiceOrder with status ACCEPTED
      const serviceOrder = manager.create(ServiceOrder, {
        bookingId: booking.id,
        code,
        status: ServiceOrderStatus.ACCEPTED,
        scheduledAt: booking.preferredAt,
      });
      const savedOrder = await manager.save(ServiceOrder, serviceOrder);

      // 5. Create TechnicianAssignment
      const assignment = manager.create(TechnicianAssignment, {
        serviceOrderId: savedOrder.id,
        technicianId: technician.id,
        isActive: true,
        assignedAt: now,
      });
      await manager.save(TechnicianAssignment, assignment);

      // 6. D-22: Record status history in same transaction
      const history = manager.create(OrderStatusHistory, {
        serviceOrderId: savedOrder.id,
        fromStatus: null,
        toStatus: ServiceOrderStatus.ACCEPTED,
        actorUserId: technician.id,
        actorRole: technician.role,
        reason: 'Technician accepted invitation',
      });
      await manager.save(OrderStatusHistory, history);

      // 7. Update this invitation to ACCEPTED
      invitation.status = InvitationStatus.ACCEPTED;
      invitation.respondedAt = now;
      await manager.save(BookingInvitation, invitation);

      // 8. Expire all other invitations for this booking (both PENDING and STANDBY)
      await manager
        .createQueryBuilder()
        .update(BookingInvitation)
        .set({
          status: InvitationStatus.EXPIRED,
          respondedAt: now,
        })
        .where('booking_id = :bookingId', { bookingId: booking.id })
        .andWhere('id != :invId', { invId: invitation.id })
        .andWhere('status IN (:...statuses)', {
          statuses: [InvitationStatus.PENDING, InvitationStatus.STANDBY],
        })
        .execute();

      // 9. Update booking status to MATCHED
      await manager.update(Booking, booking.id, {
        status: BookingStatus.MATCHED,
      });

      // Audit log within transaction
      await this.auditLogService.logWithManager(manager, {
        actorUserId: technician.id,
        actorRole: technician.role,
        action: 'INVITATION_ACCEPT',
        resourceType: 'booking_invitation',
        resourceId: invitation.id,
        after: {
          serviceOrderId: savedOrder.id,
          serviceOrderCode: code,
        },
      });

      return { invitation, serviceOrder: savedOrder };
    });
  }

  /**
   * Activate next candidate in priority sequence if available.
   */
  async inviteNextCandidate(bookingId: string): Promise<BookingInvitation | null> {
    const nextStandby = await this.invitationRepo.findOne({
      where: {
        bookingId,
        status: InvitationStatus.STANDBY,
      },
      order: { priorityOrder: 'ASC' },
    });

    if (!nextStandby) {
      this.logger.log(`No more standby candidates for booking ${bookingId}`);
      return null;
    }

    const ttlMinutes = await this.configService.getInt(
      'matching.invitation_ttl_minutes',
      30,
    );
    const now = new Date();
    nextStandby.status = InvitationStatus.PENDING;
    nextStandby.invitedAt = now;
    nextStandby.expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const saved = await this.invitationRepo.save(nextStandby);
    this.logger.log(
      `Sequential matching: activated candidate ${saved.technicianId} (priority ${saved.priorityOrder}) for booking ${bookingId}`,
    );
    return saved;
  }
}
