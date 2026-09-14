// src/modules/bookings/entities/booking-invitation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Booking } from './booking.entity';
import { User } from '../../users/entities/user.entity';
import { InvitationStatus } from '../../../shared/enums';

@Entity('booking_invitations')
@Unique('uq_invitation', ['bookingId', 'technicianId'])
@Index('ix_invitation_tech_status', ['technicianId', 'status'])
export class BookingInvitation extends BaseEntity {
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (b) => b.invitations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ name: 'technician_id', type: 'uuid' })
  technicianId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @Column({ name: 'priority_order', type: 'int', default: 0 })
  priorityOrder: number;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ name: 'invited_at', type: 'timestamptz', default: () => 'now()' })
  invitedAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
  respondedAt?: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;
}
