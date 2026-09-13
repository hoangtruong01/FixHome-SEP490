// src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Booking } from '../bookings/entities/booking.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { BookingInvitation } from '../bookings/entities/booking-invitation.entity';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { Invoice } from '../service-orders/entities/invoice.entity';
import { Cancellation } from '../service-orders/entities/cancellation.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      ServiceOrder,
      BookingInvitation,
      TechnicianAssignment,
      Invoice,
      Cancellation,
      User,
      TechnicianProfile,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
