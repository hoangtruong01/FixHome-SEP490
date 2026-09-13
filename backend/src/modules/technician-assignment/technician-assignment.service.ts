// src/modules/technician-assignment/technician-assignment.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { OrderStatusHistory } from '../service-orders/entities/order-status-history.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import { ServiceOrderStatus, Role, AccountStatus } from '../../shared/enums';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TechnicianAssignmentService {
  private readonly logger = new Logger(TechnicianAssignmentService.name);

  constructor(
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TechnicianProfile)
    private readonly profileRepo: Repository<TechnicianProfile>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Override / manual assignment of technician to a service order by SM or Admin.
   * P4.5: POST /technicians/:id/assign
   */
  async overrideAssign(
    technicianId: string,
    orderId: string,
    actorUser: { id: string; role: string },
    reason?: string,
  ): Promise<TechnicianAssignment> {
    // Validate technician
    const technician = await this.userRepo.findOneBy({ id: technicianId });
    if (!technician || technician.role !== Role.TECHNICIAN) {
      throw new NotFoundException(`Technician with id ${technicianId} not found`);
    }

    if (technician.status === AccountStatus.SUSPENDED) {
      throw new BusinessException(
        ErrorCodes.WORK_SUSPENDED,
        'Technician is currently suspended from taking orders',
      );
    }

    // Validate service order
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Service order with id ${orderId} not found`);
    }

    if (
      order.status === ServiceOrderStatus.COMPLETED ||
      order.status === ServiceOrderStatus.CANCELLED
    ) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        `Cannot assign technician to an order in ${order.status} state`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Deactivate existing active assignment if any
      const existingAssignment = await manager.findOne(TechnicianAssignment, {
        where: { serviceOrderId: orderId, isActive: true },
      });

      if (existingAssignment) {
        existingAssignment.isActive = false;
        existingAssignment.unassignedAt = new Date();
        existingAssignment.unassignReason =
          reason || 'Overridden by Staff/Admin';
        await manager.save(existingAssignment);
      }

      // 2. Create new active assignment
      const newAssignment = manager.create(TechnicianAssignment, {
        serviceOrderId: orderId,
        technicianId,
        isActive: true,
        assignedAt: new Date(),
      });
      const savedAssignment = await manager.save(newAssignment);

      // 3. If order is in PENDING_CONFIRMATION, transition to ACCEPTED
      const previousStatus = order.status;
      if (order.status === ServiceOrderStatus.PENDING_CONFIRMATION) {
        order.status = ServiceOrderStatus.ACCEPTED;
        await manager.save(order);

        // Record status history
        const history = manager.create(OrderStatusHistory, {
          serviceOrderId: orderId,
          fromStatus: previousStatus,
          toStatus: ServiceOrderStatus.ACCEPTED,
          actorUserId: actorUser.id,
          actorRole: actorUser.role,
          reason: reason || 'Technician manually assigned by Staff/Admin',
        });
        await manager.save(history);
      }

      // 4. Audit Log
      await this.auditLogService.log({
        actorUserId: actorUser.id,
        actorRole: actorUser.role,
        action: 'TECHNICIAN_OVERRIDE_ASSIGNED',
        resourceType: 'service_orders',
        resourceId: orderId,
        after: {
          technicianId,
          previousTechnicianId: existingAssignment?.technicianId || null,
          reason,
        },
      });

      this.logger.log(
        `Technician ${technicianId} assigned to order ${orderId} by ${actorUser.id}`,
      );

      return savedAssignment;
    });
  }
}
