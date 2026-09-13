// src/modules/technicians/entities/technician-service-area.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TechnicianProfile } from './technician-profile.entity';

@Entity('technician_service_areas')
@Index(
  'idx_technician_service_areas_unique',
  ['technicianId', 'provinceCode', 'districtCode'],
  { unique: true },
)
export class TechnicianServiceArea extends BaseEntity {
  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => TechnicianProfile, (t) => t.serviceAreas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'technician_id' })
  technician: TechnicianProfile;

  @Column({ name: 'province_code', type: 'varchar', length: 50 })
  provinceCode: string;

  @Column({ name: 'district_code', type: 'varchar', length: 50 })
  districtCode: string;
}
