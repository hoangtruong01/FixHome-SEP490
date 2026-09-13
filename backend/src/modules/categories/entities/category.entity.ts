// src/modules/categories/entities/category.entity.ts
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('service_categories')
@Index('idx_service_categories_code', ['code'], { unique: true })
@Index('idx_service_categories_is_active', ['isActive'])
export class ServiceCategory extends BaseEntity {
  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'slug', type: 'varchar', nullable: true, unique: true })
  slug?: string | null;

  @Column({ name: 'icon_key', type: 'varchar', nullable: true })
  iconKey?: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
