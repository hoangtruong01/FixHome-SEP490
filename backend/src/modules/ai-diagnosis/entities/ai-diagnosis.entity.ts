// src/modules/ai-diagnosis/entities/ai-diagnosis.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

@Entity('ai_diagnoses')
@Index('ix_ai_diagnoses_booking', ['bookingId'])
export class AiDiagnosis extends BaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', default: 'stub' })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  model?: string | null;

  @Column({ name: 'request_hash', type: 'varchar', nullable: true })
  requestHash?: string | null;

  @Column({ name: 'possible_issues', type: 'jsonb', nullable: true })
  possibleIssues?: Record<string, unknown>[] | null;

  @Column({ name: 'possible_causes', type: 'jsonb', nullable: true })
  possibleCauses?: Record<string, unknown>[] | null;

  @Column({ type: 'varchar', nullable: true })
  urgency?: string | null;

  @Column({ name: 'price_range_min', type: 'bigint', default: 0 })
  priceRangeMin: number;

  @Column({ name: 'price_range_max', type: 'bigint', default: 0 })
  priceRangeMax: number;

  @Column({
    name: 'suggested_service_id',
    type: 'uuid',
    nullable: true,
  })
  suggestedServiceId?: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidence: number;

  @Column({ name: 'latency_ms', type: 'int', default: 0 })
  latencyMs: number;

  @Column({ name: 'raw_response', type: 'jsonb', nullable: true })
  rawResponse?: Record<string, unknown> | null;
}
