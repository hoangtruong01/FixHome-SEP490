// src/modules/technicians/entities/technician-profile.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { VerificationStatus } from '../../../shared/enums';
import { TechnicianSkill } from './technician-skill.entity';
import { TechnicianServiceArea } from './technician-service-area.entity';
import { TechnicianSchedule } from './technician-schedule.entity';
import { TechnicianTimeOff } from './technician-time-off.entity';

@Entity('technician_profiles')
@Index('idx_technician_profiles_user_id', ['userId'], { unique: true })
export class TechnicianProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'years_experience', type: 'int', default: 0 })
  yearsExperience: number;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 5.0,
  })
  averageRating: number;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'reliability_score', type: 'int', default: 100 })
  reliabilityScore: number;

  @Column({
    name: 'work_suspended_until',
    type: 'timestamptz',
    nullable: true,
  })
  workSuspendedUntil?: Date | null;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @OneToMany(() => TechnicianSkill, (skill) => skill.technician)
  skills: TechnicianSkill[];

  @OneToMany(() => TechnicianServiceArea, (area) => area.technician)
  serviceAreas: TechnicianServiceArea[];

  @OneToMany(() => TechnicianSchedule, (schedule) => schedule.technician)
  schedules: TechnicianSchedule[];

  @OneToMany(() => TechnicianTimeOff, (timeOff) => timeOff.technician)
  timeOffs: TechnicianTimeOff[];
}
