// src/modules/service-areas/service-areas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceAreasService } from './service-areas.service';
import {
  CreateServiceAreaDto,
  QueryServiceAreaDto,
  UpdateServiceAreaDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards';
import { CurrentUser, RequirePermission, Roles } from '../../common/decorators';
import { Role } from '../../shared/enums';
import { User } from '../users/entities/user.entity';
import { UpdateActiveStatusDto } from '../../shared/dto/update-active-status.dto';

@ApiTags('Service Areas')
@Controller('service-areas')
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) {}

  @Get()
  @ApiOperation({ summary: 'List operational service areas (provinces & districts)' })
  @ApiResponse({ status: 200, description: 'List of service areas' })
  async findAll(@Query() query: QueryServiceAreaDto) {
    return this.serviceAreasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service area details by ID' })
  @ApiResponse({ status: 200, description: 'Service area details' })
  @ApiResponse({ status: 404, description: 'Service area not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceAreasService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(Role.ADMIN, Role.SERVICE_MANAGER)
  @RequirePermission('service:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/SM: Create a new operational service area' })
  @ApiResponse({ status: 201, description: 'Service area created' })
  @ApiResponse({ status: 409, description: 'Service area already exists' })
  async create(
    @Body() dto: CreateServiceAreaDto,
    @CurrentUser() user: User,
  ) {
    return this.serviceAreasService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(Role.ADMIN, Role.SERVICE_MANAGER)
  @RequirePermission('service:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/SM: Update service area details' })
  @ApiResponse({ status: 200, description: 'Service area updated' })
  @ApiResponse({ status: 404, description: 'Service area not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceAreaDto,
    @CurrentUser() user: User,
  ) {
    return this.serviceAreasService.update(id, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(Role.ADMIN, Role.SERVICE_MANAGER)
  @RequirePermission('service:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/SM: Toggle service area active status' })
  @ApiResponse({ status: 200, description: 'Service area status updated' })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.serviceAreasService.toggleStatus(id, dto.isActive, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(Role.ADMIN, Role.SERVICE_MANAGER)
  @RequirePermission('service:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/SM: Deactivate service area' })
  @ApiResponse({ status: 200, description: 'Service area deactivated' })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.serviceAreasService.toggleStatus(id, false, user);
  }
}
