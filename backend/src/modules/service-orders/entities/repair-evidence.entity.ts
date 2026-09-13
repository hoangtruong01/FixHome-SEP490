// src/modules/service-orders/entities/repair-evidence.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { EvidenceType } from '../../../shared/enums';

@Entity('repair_evidences')
@Index('ix_evidence_order_type', ['serviceOrderId', 'type'])
export class RepairEvidence extends BaseEntity {
  @Column({ name: 'service_order_id', type: 'uuid' })
  serviceOrderId: string;

  @Column({ name: 'uploader_id', type: 'uuid' })
  uploaderId: string;

  @Column({ type: 'enum', enum: EvidenceType })
  type: EvidenceType;

  @Column({ name: 'media_url', type: 'varchar' })
  mediaUrl: string;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'captured_at', type: 'timestamptz', nullable: true })
  capturedAt?: Date | null;
}
