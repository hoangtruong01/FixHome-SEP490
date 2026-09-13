// src/modules/service-orders/entities/additional-cost-request.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { AdditionalCostStatus } from '../../../shared/enums';
import { AdditionalCostItem } from './additional-cost-item.entity';

@Entity('additional_cost_requests')
export class AdditionalCostRequest extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @Column({
    type: 'enum',
    enum: AdditionalCostStatus,
    default: AdditionalCostStatus.PENDING_APPROVAL,
  })
  status: AdditionalCostStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'total_labor_delta', type: 'bigint', default: 0 })
  totalLaborDelta: number;

  @Column({ name: 'total_parts_delta', type: 'bigint', default: 0 })
  totalPartsDelta: number;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt?: Date | null;

  @Column({ name: 'decided_by_customer_id', type: 'uuid', nullable: true })
  decidedByCustomerId?: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'supersedes_id', type: 'uuid', nullable: true })
  supersedesId?: string | null;

  @OneToMany(() => AdditionalCostItem, (item) => item.request)
  items: AdditionalCostItem[];
}
