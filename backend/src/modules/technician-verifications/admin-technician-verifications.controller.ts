// src/modules/technician-verifications/admin-technician-verifications.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TechnicianVerificationsService } from './technician-verifications.service';
import { QueryVerificationsDto, RejectVerificationDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role } from '../../shared/enums';

@ApiTags('Admin / Technician Verifications')
@Controller('admin/technician-verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminTechnicianVerificationsController {
  constructor(
    private readonly verificationsService: TechnicianVerificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Admin: List all technician verification requests' })
  @ApiResponse({
    status: 200,
    description: 'List of verifications fetched successfully',
  })
  async findAll(@Query() query: QueryVerificationsDto) {
    return this.verificationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin: View details of a verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification detail fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.verificationsService.findById(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Admin: Approve technician verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  @ApiResponse({ status: 409, description: 'Already approved' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') reviewerId: string,
  ) {
    return this.verificationsService.approveVerification(id, reviewerId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Admin: Reject technician verification request' })
  @ApiResponse({
    status: 200,
    description: 'Verification rejected successfully',
  })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  @ApiResponse({ status: 409, description: 'Already rejected' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: RejectVerificationDto,
  ) {
    return this.verificationsService.rejectVerification(id, reviewerId, dto);
  }
}
