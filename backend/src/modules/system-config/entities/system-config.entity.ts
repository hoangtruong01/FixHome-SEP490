// src/modules/system-config/entities/system-config.entity.ts
import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Business configuration stored in DB — P2.3.
 * All business thresholds/amounts/durations are read from here via
 * BusinessConfigService.get(key), NEVER hard-coded.
 */
@Entity('system_configs')
export class SystemConfig {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ name: 'value_type', type: 'varchar', length: 16 })
  valueType: 'int' | 'bigint' | 'string' | 'enum' | 'boolean';

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'updated_by_user_id', type: 'uuid', nullable: true })
  updatedByUserId: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
