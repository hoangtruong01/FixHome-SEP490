// src/modules/service-orders/entities/invoice.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { PaymentStatus } from '../../../shared/enums';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'labor_total', type: 'bigint', default: 0 })
  laborTotal: number;

  @Column({ name: 'parts_total', type: 'bigint', default: 0 })
  partsTotal: number;

  @Column({ name: 'grand_total', type: 'bigint', default: 0 })
  grandTotal: number;

  @Column({ name: 'commission_base', type: 'varchar', default: 'LABOR' })
  commissionBase: string;

  @Column({ name: 'commission_amount', type: 'bigint', default: 0 })
  commissionAmount: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'now()' })
  issuedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];
}
