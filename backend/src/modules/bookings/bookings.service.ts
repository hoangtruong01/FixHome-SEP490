// src/modules/bookings/bookings.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingMedia } from './entities/booking-media.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Address } from '../users/entities/address.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import { BookingStatus, Role, UrgencyLevel } from '../../shared/enums';
import { AuditLogService } from '../audit-log/audit-log.service';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import { TechnicianSkill } from '../technicians/entities/technician-skill.entity';
import { TechnicianServiceArea } from '../technicians/entities/technician-service-area.entity';

export interface CreateBookingDto {
  serviceId: string;
  addressId?: string;
  description: string;
  preferredAt?: string;
  urgency?: UrgencyLevel;
}

export interface TechnicianCandidate {
  technicianId: string;
  userId: string;
  fullName: string;
  averageRating: number;
  ratingCount: number;
  reliabilityScore: number;
  yearsExperience: number;
  isAvailable: boolean;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingMedia)
    private readonly mediaRepo: Repository<BookingMedia>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(TechnicianProfile)
    private readonly techProfileRepo: Repository<TechnicianProfile>,
    @InjectRepository(TechnicianSkill)
    private readonly techSkillRepo: Repository<TechnicianSkill>,
    @InjectRepository(TechnicianServiceArea)
    private readonly techAreaRepo: Repository<TechnicianServiceArea>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new booking. Validates service, address ownership, and suspension.
   */
  async create(dto: CreateBookingDto, customer: { id: string; role: string }): Promise<Booking> {
    // Check suspension
    const user = await this.userRepo.findOneBy({ id: customer.id });
    if (!user) throw new NotFoundException('User not found');
    if (user.bookingSuspendedUntil && user.bookingSuspendedUntil > new Date()) {
      throw new BusinessException(
        ErrorCodes.BOOKING_SUSPENDED,
        `Account suspended until ${user.bookingSuspendedUntil.toISOString()}`,
        { suspendedUntil: user.bookingSuspendedUntil },
      );
    }

    // Validate service
    const service = await this.serviceRepo.findOneBy({ id: dto.serviceId });
    if (!service || !service.isActive) {
      throw new BusinessException(ErrorCodes.NOT_FOUND, 'Service not found or inactive');
    }

    // Validate address belongs to customer
    if (dto.addressId) {
      const address = await this.addressRepo.findOneBy({
        id: dto.addressId,
        userId: customer.id,
      });
      if (!address) {
        throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Address not found');
      }
    }

    const booking = this.bookingRepo.create({
      customerId: customer.id,
      serviceId: dto.serviceId,
      addressId: dto.addressId || null,
      description: dto.description,
      preferredAt: dto.preferredAt ? new Date(dto.preferredAt) : null,
      urgency: dto.urgency || UrgencyLevel.MEDIUM,
      status: BookingStatus.PENDING,
    });

    const saved = await this.bookingRepo.save(booking);

    await this.auditLogService.log({
      actorUserId: customer.id,
      actorRole: customer.role,
      action: 'BOOKING_CREATE',
      resourceType: 'booking',
      resourceId: saved.id,
      after: { serviceId: dto.serviceId, urgency: saved.urgency },
    });

    return saved;
  }

  /**
   * Get bookings for a customer with pagination.
   */
  async findMyBookings(
    customerId: string,
    options: { page?: number; limit?: number; status?: BookingStatus },
  ): Promise<{ data: Booking[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .where('b.customerId = :customerId', { customerId })
      .leftJoinAndSelect('b.service', 'service');

    if (options.status) {
      qb.andWhere('b.status = :status', { status: options.status });
    }

    qb.orderBy('b.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Get a booking by ID with ownership check.
   */
  async findById(
    id: string,
    actor: { id: string; role: string },
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['service', 'address', 'media', 'invitations'],
    });
    if (!booking) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Booking not found');
    }

    // Ownership check
    if (
      actor.role !== Role.ADMIN &&
      actor.role !== Role.SERVICE_MANAGER &&
      booking.customerId !== actor.id
    ) {
      // Check if actor is an invited technician
      const isInvited = booking.invitations?.some(
        (inv) => inv.technicianId === actor.id,
      );
      if (!isInvited) {
        throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Booking not found');
      }
    }

    return booking;
  }

  /**
   * Get technician candidates for a booking.
   * Hard-filter by skill + area, then rank by rating, reliability.
   */
  async getCandidates(
    bookingId: string,
    customer: { id: string },
  ): Promise<TechnicianCandidate[]> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, customerId: customer.id },
      relations: ['service', 'address'],
    });
    if (!booking) {
      throw new BusinessException(ErrorCodes.OWNERSHIP_DENIED, 'Booking not found');
    }

    // Find technicians with the matching skill
    const qb = this.techProfileRepo
      .createQueryBuilder('tp')
      .innerJoinAndSelect('tp.user', 'user')
      .innerJoin('tp.skills', 'skill', 'skill.serviceId = :serviceId', {
        serviceId: booking.serviceId,
      })
      .where('tp.isAvailable = :available', { available: true })
      .andWhere('tp.verificationStatus = :verified', { verified: 'approved' })
      .andWhere('(tp.workSuspendedUntil IS NULL OR tp.workSuspendedUntil < :now)', {
        now: new Date(),
      })
      .andWhere('user.status = :active', { active: 'active' });

    // Filter by service area if address has province/district
    if (booking.address?.province) {
      qb.innerJoin(
        'tp.serviceAreas',
        'area',
        'area.districtCode = :district OR area.provinceCode = :province',
        {
          district: booking.address.district || '',
          province: booking.address.province || '',
        },
      );
    }

    qb.orderBy('tp.averageRating', 'DESC')
      .addOrderBy('tp.reliabilityScore', 'DESC')
      .take(20); // Return up to 20 candidates for customer to pick ≤5

    const profiles = await qb.getMany();

    return profiles.map((tp) => ({
      technicianId: tp.id,
      userId: tp.userId,
      fullName: tp.user?.fullName || '',
      averageRating: Number(tp.averageRating),
      ratingCount: tp.ratingCount,
      reliabilityScore: tp.reliabilityScore,
      yearsExperience: tp.yearsExperience,
      isAvailable: tp.isAvailable,
    }));
  }

  /**
   * Update booking status.
   */
  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.bookingRepo.update(bookingId, { status });
  }
}
