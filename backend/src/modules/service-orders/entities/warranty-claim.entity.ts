// src/modules/service-orders/entities/warranty-claim.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { WarrantyClaimStatus } from '../../../shared/enums';
import { ServiceOrder } from './service-order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('warranty_claims')
export class WarrantyClaim extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @ManyToOne(() => ServiceOrder, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: WarrantyClaimStatus,
    default: WarrantyClaimStatus.SUBMITTED,
  })
  status: WarrantyClaimStatus;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'now()' })
  submittedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string | null;
}
