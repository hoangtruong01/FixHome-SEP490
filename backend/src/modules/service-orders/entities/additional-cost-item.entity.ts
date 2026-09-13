// src/modules/service-orders/entities/additional-cost-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CostItemType } from '../../../shared/enums';
import { AdditionalCostRequest } from './additional-cost-request.entity';

@Entity('additional_cost_items')
export class AdditionalCostItem extends BaseEntity {
  @Column({ name: 'request_id', type: 'uuid' })
  requestId: string;

  @ManyToOne(() => AdditionalCostRequest, (r) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: AdditionalCostRequest;

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

  @Column({ name: 'warranty_days', type: 'int', default: 0 })
  warrantyDays: number;
}
