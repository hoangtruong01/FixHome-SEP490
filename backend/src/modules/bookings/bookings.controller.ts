// src/modules/bookings/bookings.controller.ts
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
import { BookingsService, CreateBookingDto } from './bookings.service';
import { InvitationsService } from './invitations.service';
import { BookingStatus } from '../../shared/enums';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('booking:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(@Body() dto: CreateBookingDto, @Req() req: { user: { id: string; role: string } }) {
    const booking = await this.bookingsService.create(dto, req.user);
    return { data: booking };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('booking:read_own')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my bookings' })
  async findMy(
    @Req() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: BookingStatus,
  ) {
    const result = await this.bookingsService.findMyBookings(req.user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 20,
      status,
    });
    return { data: result.data, meta: { total: result.total } };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  async findById(@Param('id') id: string, @Req() req: { user: { id: string; role: string } }) {
    const booking = await this.bookingsService.findById(id, req.user);
    return { data: booking };
  }

  @Get(':id/technician-candidates')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invitation:shortlist')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get technician candidates for a booking' })
  async getCandidates(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    const candidates = await this.bookingsService.getCandidates(id, req.user);
    return { data: candidates };
  }

  @Post(':id/shortlist')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invitation:shortlist')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shortlist of technician invitations (≤5)' })
  async createShortlist(
    @Param('id') id: string,
    @Body() body: { technicianIds: string[] },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const invitations = await this.invitationsService.createShortlist(
      id,
      body.technicianIds,
      req.user,
    );
    return { data: invitations };
  }
}
