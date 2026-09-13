// src/modules/services/admin-services.controller.ts
import {
  Body,
  Delete,
  Get,
  Query,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto, QueryServicesDto } from './dto';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards';
import { CurrentUser, RequirePermission, Roles } from '../../common/decorators';
import { Role } from '../../shared/enums';
import { UpdateActiveStatusDto } from '../../shared/dto/update-active-status.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Admin / Services')
@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.SERVICE_MANAGER)
@RequirePermission('service:manage')
@ApiBearerAuth()
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a service without deleting referenced data' })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.toggleStatus(id, false, user);
  }

  @Get()
  @ApiOperation({ summary: 'Admin: Browse active and inactive services' })
  findAll(@Query() query: QueryServicesDto) {
    return this.servicesService.findServices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin: Read service including inactive data' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Admin: Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Service code already exists' })
  async create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update service details and price ranges' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin: Toggle service active/inactive status' })
  @ApiResponse({
    status: 200,
    description: 'Service status updated successfully',
  })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.servicesService.toggleStatus(id, dto.isActive, user);
  }
}
