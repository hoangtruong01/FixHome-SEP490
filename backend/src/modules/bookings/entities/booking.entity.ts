// src/modules/bookings/entities/booking.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { Address } from '../../users/entities/address.entity';
import { BookingStatus, UrgencyLevel } from '../../../shared/enums';
import { BookingMedia } from './booking-media.entity';
import { BookingInvitation } from './booking-invitation.entity';

@Entity('bookings')
@Index('ix_bookings_customer', ['customerId', 'createdAt'])
@Index('ix_bookings_status', ['status'])
export class Booking extends BaseEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ name: 'address_id', type: 'uuid', nullable: true })
  addressId?: string | null;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'address_id' })
  address?: Address | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'preferred_at', type: 'timestamptz', nullable: true })
  preferredAt?: Date | null;

  @Column({
    type: 'enum',
    enum: UrgencyLevel,
    default: UrgencyLevel.MEDIUM,
  })
  urgency: UrgencyLevel;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @OneToMany(() => BookingMedia, (m) => m.booking)
  media: BookingMedia[];

  @OneToMany(() => BookingInvitation, (inv) => inv.booking)
  invitations: BookingInvitation[];
}
