// src/modules/services/entities/service.entity.ts
import { Entity, Column, Index, ManyToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { ServiceCategory } from '../../categories/entities/category.entity';

@Entity('services')
@Index('idx_services_code', ['code'], { unique: true })
@Index('idx_services_category_id', ['categoryId'])
@Index('idx_services_is_active', ['isActive'])
@Check(
  'chk_services_prices',
  '"base_price" >= 0 AND "min_price" >= 0 AND "max_price" >= 0 AND "min_price" <= "max_price"',
)
export class Service extends BaseEntity {
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ServiceCategory, (cat) => cat.services, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'slug', type: 'varchar', nullable: true, unique: true })
  slug?: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  basePrice: number;

  @Column({
    name: 'min_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  minPrice: number;

  @Column({
    name: 'max_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxPrice: number;

  @Column({ name: 'estimated_minutes', type: 'int', default: 60 })
  estimatedMinutes: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  get basePriceMin(): number {
    return Number(this.minPrice ?? this.basePrice ?? 0);
  }

  get basePriceMax(): number {
    return Number(this.maxPrice ?? this.basePrice ?? 0);
  }
}
