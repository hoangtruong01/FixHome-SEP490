// src/modules/services/services.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { QueryServicesDto } from './dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Public: Browse services catalog with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Services list fetched successfully',
  })
  async findServices(@Query() query: QueryServicesDto) {
    query.isActive = true;
    return this.servicesService.findServices(query, true);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Public: Get service detail by ID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Service detail fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    return this.servicesService.findByIdOrSlug(idOrSlug, true);
  }
}
