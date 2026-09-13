// src/modules/categories/categories.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Service Categories')
@Controller(['service-categories', 'categories'])
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Public: List active service categories' })
  @ApiResponse({ status: 200, description: 'Categories fetched successfully' })
  async findAll() {
    return this.categoriesService.findAll(true);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Public: Get category details with services by ID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Category detail fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findByIdOrSlug(idOrSlug, true);
  }
}
