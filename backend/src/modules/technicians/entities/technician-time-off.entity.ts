// src/modules/technicians/entities/technician-time-off.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TechnicianProfile } from './technician-profile.entity';

@Entity('technician_time_off')
@Index('idx_technician_time_off_range', ['technicianId', 'startAt', 'endAt'])
export class TechnicianTimeOff extends BaseEntity {
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => TechnicianProfile, (t) => t.timeOffs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'technician_id' })
  technician: TechnicianProfile;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string | null;
}
