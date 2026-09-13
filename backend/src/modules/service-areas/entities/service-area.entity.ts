// src/modules/service-areas/entities/service-area.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

@Entity('service_areas')
@Index('idx_service_areas_province_district', ['provinceCode', 'districtCode'], {
  unique: true,
})
@Index('idx_service_areas_province_code', ['provinceCode'])
@Index('idx_service_areas_is_active', ['isActive'])
export class ServiceArea extends BaseEntity {
  @Column({ name: 'province_code', type: 'varchar' })
  provinceCode: string;

  @Column({ name: 'province_name', type: 'varchar' })
  provinceName: string;

  @Column({ name: 'district_code', type: 'varchar' })
  districtCode: string;

  @Column({ name: 'district_name', type: 'varchar' })
  districtName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
