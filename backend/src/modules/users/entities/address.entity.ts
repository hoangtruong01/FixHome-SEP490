// src/modules/users/entities/address.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from './user.entity';

@Entity('addresses')
@Index('idx_addresses_user_id', ['userId'])
export class Address extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  label?: string | null;

  @Column({ type: 'varchar', length: 255 })
  line1: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  ward?: string | null;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng?: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
}
