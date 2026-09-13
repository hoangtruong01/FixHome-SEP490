// src/modules/service-orders/entities/order-status-history.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * D-22: Every state transition MUST insert a row in this table
 * within the same transaction as the status update.
 */
@Entity('order_status_history')
@Index('ix_status_history_order', ['serviceOrderId', 'createdAt'])
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'from_status', type: 'varchar', nullable: true })
  fromStatus?: string | null;

  @Column({ name: 'to_status', type: 'varchar' })
  toStatus: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: string | null;

  @Column({ name: 'actor_role', type: 'varchar', nullable: true })
  actorRole?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
