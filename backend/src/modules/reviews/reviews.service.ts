// src/modules/reviews/reviews.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ServiceOrder } from '../service-orders/entities/service-order.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TechnicianAssignment } from '../service-orders/entities/technician-assignment.entity';
import { TechnicianProfile } from '../technicians/entities/technician-profile.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import { ServiceOrderStatus, Role } from '../../shared/enums';
import { AuditLogService } from '../audit-log/audit-log.service';

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(ServiceOrder)
    private readonly orderRepo: Repository<ServiceOrder>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(TechnicianProfile)
    private readonly techProfileRepo: Repository<TechnicianProfile>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create review for completed service order.
   * D-09: One review per service order (enforced at DB level uq_review_order).
   */
  async createReview(
    orderId: string,
    dto: CreateReviewDto,
    customerUser: { id: string; role: string },
  ): Promise<Review> {
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_FAILED,
        'Rating must be between 1 and 5',
      );
    }

    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Service order ${orderId} not found`);
    }

    if (order.status !== ServiceOrderStatus.COMPLETED) {
      throw new BusinessException(
        ErrorCodes.ORDER_INVALID_TRANSITION,
        'Only COMPLETED orders can be reviewed',
      );
    }

    // Verify customer owns the order
    const booking = await this.bookingRepo.findOneBy({ id: order.bookingId });
    if (
      !booking ||
      (booking.customerId !== customerUser.id &&
        customerUser.role !== Role.ADMIN)
    ) {
      throw new BusinessException(
        ErrorCodes.OWNERSHIP_DENIED,
        'Only the customer of this order can submit a review',
      );
    }

    // Check for existing review
    const existing = await this.reviewRepo.findOneBy({ serviceOrderId: orderId });
    if (existing) {
      throw new BusinessException(
        ErrorCodes.ADDITIONAL_COST_ALREADY_DECIDED, // or DUPLICATE_REVIEW
        'A review has already been submitted for this order',
      );
    }

    // Find technician who serviced the order
    const assignment = await this.assignmentRepo.findOne({
      where: { serviceOrderId: orderId },
      order: { assignedAt: 'DESC' },
    });
    if (!assignment) {
      throw new BusinessException(
        ErrorCodes.VALIDATION_FAILED,
        'No technician found for this order',
      );
    }

    const technicianId = assignment.technicianId;

    return this.dataSource.transaction(async (manager) => {
      const review = manager.create(Review, {
        serviceOrderId: orderId,
        customerId: customerUser.id,
        technicianId,
        rating: Math.round(dto.rating),
        comment: dto.comment || null,
        isModerated: false,
      });

      const savedReview = await manager.save(review);

      // Recalculate technician rating
      const reviews = await manager.find(Review, {
        where: { technicianId },
      });

      const count = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;

      const profile = await manager.findOne(TechnicianProfile, {
        where: { userId: technicianId },
      });
      if (profile) {
        profile.averageRating = avg;
        profile.ratingCount = count;
        await manager.save(profile);
      }

      await this.auditLogService.log({
        actorUserId: customerUser.id,
        actorRole: customerUser.role,
        action: 'REVIEW_SUBMITTED',
        resourceType: 'review',
        resourceId: savedReview.id,
        after: { orderId, technicianId, rating: dto.rating },
      });

      return savedReview;
    });
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    return this.reviewRepo.findOneBy({ serviceOrderId: orderId });
  }

  async findByTechnicianId(
    technicianId: string,
    options: { page?: number; limit?: number },
  ): Promise<{ data: Review[]; total: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);

    const [data, total] = await this.reviewRepo.findAndCount({
      where: { technicianId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
