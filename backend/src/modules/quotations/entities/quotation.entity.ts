// src/modules/quotations/entities/quotation.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { QuotationStatus } from '../../../shared/enums';
import { QuotationItem } from './quotation-item.entity';

@Entity('quotations')
export class Quotation extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @Column({ name: 'labor_total', type: 'bigint', default: 0 })
  laborTotal: number;

  @Column({ name: 'parts_total', type: 'bigint', default: 0 })
  partsTotal: number;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt?: Date | null;

  @OneToMany(() => QuotationItem, (item) => item.quotation)
  items: QuotationItem[];
}
