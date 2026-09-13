// src/modules/users/entities/user.entity.ts
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Role, AccountStatus } from '../../../shared/enums';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_phone_number', ['phoneNumber'], {
  unique: true,
  where: '"phone_number" IS NOT NULL',
})
@Index('idx_users_role', ['role'])
@Index('idx_users_status', ['status'])
export class User extends BaseEntity {
  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', select: false })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl?: string | null;

  @Column({
    name: 'booking_suspended_until',
    type: 'timestamptz',
    nullable: true,
  })
  bookingSuspendedUntil?: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
