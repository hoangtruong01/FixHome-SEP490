// src/modules/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { InvitationsController } from './invitations.controller';
import { BookingsService } from './bookings.service';
import { InvitationsService } from './invitations.service';
import { Booking } from './entities/booking.entity';
import { BookingMedia } from './entities/booking-media.entity';
import { BookingInvitation } from './entities/booking-invitation.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Address } from '../users/entities/address.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import { TechnicianSkill } from '../technicians/entities/technician-skill.entity';
import { TechnicianServiceArea } from '../technicians/entities/technician-service-area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingMedia,
      BookingInvitation,
      User,
      Service,
      Address,
      TechnicianProfile,
      TechnicianSkill,
      TechnicianServiceArea,
    ]),
  ],
  controllers: [BookingsController, InvitationsController],
  providers: [BookingsService, InvitationsService],
  exports: [BookingsService, InvitationsService],
})
export class BookingsModule {}
