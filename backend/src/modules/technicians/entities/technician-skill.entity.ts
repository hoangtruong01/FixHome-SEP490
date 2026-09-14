// src/modules/technicians/entities/technician-skill.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TechnicianProfile } from './technician-profile.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('technician_skills')
@Index('idx_technician_skills_unique', ['technicianId', 'serviceId'], {
  unique: true,
})
export class TechnicianSkill extends BaseEntity {
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => TechnicianProfile, (t) => t.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'technician_id' })
  technician: TechnicianProfile;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'varchar', length: 50, default: 'INTERMEDIATE' })
  level: string;

  @Column({
    name: 'listed_labor_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  listedLaborPrice?: number | null;

  @Column({ name: 'typical_warranty_days', type: 'int', default: 30, nullable: true })
  typicalWarrantyDays?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
