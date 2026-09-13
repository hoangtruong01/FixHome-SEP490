// src/modules/service-orders/entities/service-order.entity.ts
import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { ServiceOrderStatus, PaymentStatus } from '../../../shared/enums';

@Entity('service_orders')
@Unique('uq_order_booking', ['bookingId'])
@Index('ix_order_status_created', ['status', 'createdAt'])
export class ServiceOrder extends BaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({
    type: 'enum',
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.PENDING_CONFIRMATION,
  })
  status: ServiceOrderStatus;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt?: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: 'labor_total', type: 'bigint', default: 0 })
  laborTotal: number;

  @Column({ name: 'parts_total', type: 'bigint', default: 0 })
  partsTotal: number;

  @Column({ name: 'grand_total', type: 'bigint', default: 0 })
  grandTotal: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;
}
