// src/modules/service-orders/entities/cancellation.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { CancelActor, CompensationStatus } from '../../../shared/enums';

@Entity('cancellations')
export class Cancellation extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ type: 'enum', enum: CancelActor })
  actor: CancelActor;

  @Column({ name: 'actor_user_id', type: 'uuid' })
  actorUserId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'state_at_cancel', type: 'varchar' })
  stateAtCancel: string;

  @Column({ name: 'strike_applied', type: 'boolean', default: false })
  strikeApplied: boolean;

  @Column({
    name: 'compensation_status',
    type: 'enum',
    enum: CompensationStatus,
    default: CompensationStatus.NOT_ELIGIBLE,
  })
  compensationStatus: CompensationStatus;

  @Column({ name: 'reviewed_by_user_id', type: 'uuid', nullable: true })
  reviewedByUserId?: string | null;
}
