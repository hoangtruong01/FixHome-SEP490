// src/modules/service-orders/entities/cancellation-strike.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { StrikeStatus } from '../../../shared/enums';

@Entity('cancellation_strikes')
@Index('ix_strike_user_status', ['userId', 'status'])
export class CancellationStrike extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'cancellation_id', type: 'uuid' })
  cancellationId: string;

  @Column({ type: 'varchar' })
  role: string;

  @Column({
    type: 'enum',
    enum: StrikeStatus,
    default: StrikeStatus.ACTIVE,
  })
  status: StrikeStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'waived_by_user_id', type: 'uuid', nullable: true })
  waivedByUserId?: string | null;

  @Column({ name: 'waive_reason', type: 'text', nullable: true })
  waiveReason?: string | null;
}
