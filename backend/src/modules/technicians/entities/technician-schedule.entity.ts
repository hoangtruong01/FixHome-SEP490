// src/modules/technicians/entities/technician-schedule.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TechnicianProfile } from './technician-profile.entity';

@Entity('technician_schedules')
@Index('idx_technician_schedules_tech_day', ['technicianId', 'dayOfWeek'])
export class TechnicianSchedule extends BaseEntity {
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => TechnicianProfile, (t) => t.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'technician_id' })
  technician: TechnicianProfile;

  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek: number;

  /** e.g. "08:00" */
  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  /** e.g. "17:00" */
  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;
}
