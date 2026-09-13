// src/modules/dashboard/dashboard.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { BookingInvitation } from '../bookings/entities/booking-invitation.entity';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { Invoice } from '../service-orders/entities/invoice.entity';
import { Cancellation } from '../service-orders/entities/cancellation.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import {
  BookingStatus,
  ServiceOrderStatus,
  InvitationStatus,
  PaymentStatus,
} from '../../shared/enums';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(BookingInvitation)
    private readonly invitationRepo: Repository<BookingInvitation>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Cancellation)
    private readonly cancellationRepo: Repository<Cancellation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TechnicianProfile)
    private readonly profileRepo: Repository<TechnicianProfile>,
  ) {}

  /**
   * Customer dashboard: active bookings, recent orders, total spent.
   */
  async getCustomerDashboard(userId: string) {
    const activeBookings = await this.bookingRepo.count({
      where: [
        { customerId: userId, status: BookingStatus.PENDING },
        { customerId: userId, status: BookingStatus.MATCHING },
      ],
    });

    const recentBookings = await this.bookingRepo.find({
      where: { customerId: userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Recent orders
    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('bookings', 'b', 'b.id = o.booking_id')
      .where('b.customer_id = :userId', { userId })
      .orderBy('o.createdAt', 'DESC')
      .take(5)
      .getMany();

    const activeOrdersCount = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('bookings', 'b', 'b.id = o.booking_id')
      .where('b.customer_id = :userId', { userId })
      .andWhere('o.status IN (:...statuses)', {
        statuses: [
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.EN_ROUTE,
          ServiceOrderStatus.UNDER_REPAIR,
        ],
      })
      .getCount();

    return {
      activeBookings,
      activeOrdersCount,
      recentBookings,
      recentOrders: orders,
    };
  }

  /**
   * Technician dashboard: pending invitations, active orders, today's schedule.
   */
  async getTechnicianDashboard(userId: string) {
    const pendingInvitations = await this.invitationRepo.count({
      where: {
        technicianId: userId,
        status: InvitationStatus.PENDING,
      },
    });

    const activeAssignments = await this.assignmentRepo
      .createQueryBuilder('ta')
      .innerJoinAndSelect('service_orders', 'so', 'so.id = ta.service_order_id')
      .where('ta.technician_id = :userId', { userId })
      .andWhere('ta.is_active = true')
      .andWhere('so.status IN (:...statuses)', {
        statuses: [
          ServiceOrderStatus.ACCEPTED,
          ServiceOrderStatus.EN_ROUTE,
          ServiceOrderStatus.UNDER_REPAIR,
        ],
      })
      .getMany();

    const profile = await this.profileRepo.findOneBy({ userId });

    const completedOrdersCount = await this.assignmentRepo
      .createQueryBuilder('ta')
      .innerJoin('service_orders', 'so', 'so.id = ta.service_order_id')
      .where('ta.technician_id = :userId', { userId })
      .andWhere('so.status = :status', { status: ServiceOrderStatus.COMPLETED })
      .getCount();

    return {
      pendingInvitations,
      activeOrdersCount: activeAssignments.length,
      completedOrdersCount,
      rating: profile?.averageRating || 5.0,
      ratingCount: profile?.ratingCount || 0,
      activeJobs: activeAssignments,
    };
  }

  /**
   * Operations dashboard (Service Manager):
   * Summary of all orders by status, unassigned bookings, pending cancellations.
   */
  async getOperationalDashboard() {
    const ordersByStatus = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.status')
      .getRawMany();

    const pendingCancellations = await this.cancellationRepo.count({
      where: { reviewedByUserId: null as any },
    });

    const activeOrders = await this.orderRepo.count({
      where: [
        { status: ServiceOrderStatus.ACCEPTED },
        { status: ServiceOrderStatus.EN_ROUTE },
        { status: ServiceOrderStatus.UNDER_REPAIR },
      ],
    });

    const matchingBookings = await this.bookingRepo.count({
      where: [
        { status: BookingStatus.PENDING },
        { status: BookingStatus.MATCHING },
      ],
    });

    return {
      ordersByStatus,
      activeOrders,
      matchingBookings,
      pendingCancellations,
    };
  }

  /**
   * System dashboard (Admin):
   * Total users by role, revenue, platform health metrics.
   */
  async getSystemDashboard() {
    const usersByRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();

    const totalOrders = await this.orderRepo.count();
    const completedOrders = await this.orderRepo.count({
      where: { status: ServiceOrderStatus.COMPLETED },
    });

    const revenueResult = await this.invoiceRepo
      .createQueryBuilder('i')
      .select('SUM(i.grand_total)', 'totalRevenue')
      .addSelect('SUM(i.commission_amount)', 'totalCommission')
      .where('i.payment_status = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    return {
      usersByRole,
      totalOrders,
      completedOrders,
      totalRevenue: Number(revenueResult?.totalRevenue || 0),
      totalCommission: Number(revenueResult?.totalCommission || 0),
    };
  }
}
