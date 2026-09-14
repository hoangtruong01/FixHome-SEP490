// src/modules/service-orders/entities/commission-due.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CommissionDueStatus } from '../../../shared/enums';
import { ServiceOrder } from './service-order.entity';
import { User } from '../../users/entities/user.entity';
import { CashSettlement } from './cash-settlement.entity';

@Entity('commission_dues')
export class CommissionDue extends BaseEntity {
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @ManyToOne(() => ServiceOrder, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @Column({ name: 'cash_settlement_id', type: 'uuid', nullable: true })
  cashSettlementId?: string | null;

  @ManyToOne(() => CashSettlement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cash_settlement_id' })
  cashSettlement?: CashSettlement | null;

  @Column({
    name: 'labor_total_snapshot',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  laborTotalSnapshot: number;

  @Column({
    name: 'commission_rate_snapshot',
    type: 'numeric',
    precision: 5,
    scale: 4,
    default: 0.1,
  })
  commissionRateSnapshot: number;

  @Column({
    name: 'due_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  dueAmount: number;

  @Column({
    type: 'enum',
    enum: CommissionDueStatus,
    default: CommissionDueStatus.PENDING,
  })
  status: CommissionDueStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate?: Date | null;
}
