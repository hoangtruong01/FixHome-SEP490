// src/modules/audit-log/entities/audit-log.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Append-only audit log — P3.2.
 * Records: lock user, assign override, config changes, cancellations,
 * waive strike, price changes, and other sensitive operations.
 *
 * P0.3 #8: No PII (password, token, exact coordinates) in logs.
 */
@Entity('audit_logs')
@Index('ix_audit_actor', ['actorUserId'])
@Index('ix_audit_resource', ['resourceType', 'resourceId'])
@Index('ix_audit_created', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ name: 'actor_role', type: 'varchar', length: 32, nullable: true })
  actorRole: string | null;

  @Column({ type: 'varchar', length: 128 })
  action: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 64 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 128, nullable: true })
  resourceId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
