// src/modules/reviews/entities/review.entity.ts
import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

@Entity('reviews')
@Unique('uq_review_order', ['serviceOrderId'])
export class Review extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;
}
