// src/modules/service-orders/entities/cash-settlement.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CashSettlementStatus } from '../../../shared/enums';
import { ServiceOrder } from './service-order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cash_settlements')
export class CashSettlement extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid', unique: true })
  serviceOrderId: string;

  @OneToOne(() => ServiceOrder, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @Column({ name: 'declared_by_technician_id', type: 'uuid' })
  declaredByTechnicianId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'declared_by_technician_id' })
  declaredByTechnician: User;

  @Column({
    name: 'declared_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  declaredAmount: number;

  @Column({ name: 'declared_at', type: 'timestamptz', default: () => 'now()' })
  declaredAt: Date;

  @Column({ name: 'technician_notes', type: 'text', nullable: true })
  technicianNotes?: string | null;

  @Column({ name: 'receipt_evidence_url', type: 'text', nullable: true })
  receiptEvidenceUrl?: string | null;

  @Column({ name: 'confirmed_by_customer_id', type: 'uuid', nullable: true })
  confirmedByCustomerId?: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'confirmed_by_customer_id' })
  confirmedByCustomer?: User | null;

  @Column({
    name: 'confirmed_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  confirmedAmount?: number | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt?: Date | null;

  @Column({
    type: 'enum',
    enum: CashSettlementStatus,
    default: CashSettlementStatus.PENDING_CONFIRMATION,
  })
  status: CashSettlementStatus;

  @Column({ name: 'manager_resolution_reason', type: 'text', nullable: true })
  managerResolutionReason?: string | null;

  @Column({ name: 'resolved_by_manager_id', type: 'uuid', nullable: true })
  resolvedByManagerId?: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resolved_by_manager_id' })
  resolvedByManager?: User | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date | null;
}
