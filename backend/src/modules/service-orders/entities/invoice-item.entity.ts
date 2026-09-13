// src/modules/service-orders/entities/invoice-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CostItemType } from '../../../shared/enums';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'source_type', type: 'varchar', default: 'QUOTATION' })
  sourceType: string;

  @Column({ name: 'source_item_id', type: 'uuid', nullable: true })
  sourceItemId?: string | null;

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
