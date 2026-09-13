// src/modules/reviews/reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ReviewsService, CreateReviewDto } from './reviews.service';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('service-orders/:id/reviews')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('rating:create_own_order')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer submits a review for a completed order' })
  async createReview(
    @Param('id') orderId: string,
    @Body() dto: CreateReviewDto,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const review = await this.reviewsService.createReview(
      orderId,
      dto,
      req.user,
    );
    return { data: review };
  }

  @Get('service-orders/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get review for a service order' })
  async getByOrderId(@Param('id') orderId: string) {
    const review = await this.reviewsService.findByOrderId(orderId);
    return { data: review };
  }

  @Get('technicians/:id/reviews')
  @ApiOperation({ summary: 'Get reviews for a technician' })
  async getByTechnicianId(
    @Param('id') technicianId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.reviewsService.findByTechnicianId(technicianId, {
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { data: result.data, meta: { total: result.total } };
  }
}
