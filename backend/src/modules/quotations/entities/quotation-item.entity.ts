// src/modules/quotations/entities/quotation-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CostItemType } from '../../../shared/enums';
import { Quotation } from './quotation.entity';

@Entity('quotation_items')
export class QuotationItem extends BaseEntity {
  @Column({ name: 'quotation_id', type: 'uuid' })
  quotationId: string;

  @ManyToOne(() => Quotation, (q) => q.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ type: 'enum', enum: CostItemType })
  type: CostItemType;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'bigint', default: 0 })
  unitPrice: number;

  @Column({ name: 'line_total', type: 'bigint', default: 0 })
  lineTotal: number;

  @Column({ name: 'warranty_days_snapshot', type: 'int', default: 0 })
  warrantyDaysSnapshot: number;
}
