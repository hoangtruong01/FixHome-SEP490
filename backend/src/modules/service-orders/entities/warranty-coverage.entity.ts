// src/modules/service-orders/entities/warranty-coverage.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { WarrantyStatus } from '../../../shared/enums';

@Entity('warranty_coverages')
export class WarrantyCoverage extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'invoice_item_id', type: 'uuid', nullable: true })
  invoiceItemId?: string | null;

  @Column({ name: 'warranty_days_snapshot', type: 'int', default: 0 })
  warrantyDaysSnapshot: number;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'starts_at', type: 'timestamptz', default: () => 'now()' })
  startsAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: WarrantyStatus,
    default: WarrantyStatus.ACTIVE,
  })
  status: WarrantyStatus;
}
