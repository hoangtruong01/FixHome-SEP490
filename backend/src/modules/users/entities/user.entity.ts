// src/modules/users/entities/user.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Role } from '../../../shared/enums';

// TODO: Add additional user fields as per requirement
// This is a base entity – extend when implementing user features

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
