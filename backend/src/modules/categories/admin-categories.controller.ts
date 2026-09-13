// src/modules/categories/admin-categories.controller.ts
import {
  Body,
  Delete,
  Get,
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard, RolesGuard, PermissionGuard } from '../../common/guards';
import { CurrentUser, RequirePermission, Roles } from '../../common/decorators';
import { Role } from '../../shared/enums';
import { UpdateActiveStatusDto } from '../../shared/dto/update-active-status.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Admin / Service Categories')
@Controller(['admin/service-categories', 'admin/categories'])
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(Role.ADMIN, Role.SERVICE_MANAGER)
@RequirePermission('service:manage')
@ApiBearerAuth()
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a category without deleting referenced data' })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.toggleStatus(id, false, user);
  }

  @Get()
  @ApiOperation({ summary: 'Admin: List active and inactive categories' })
  findAll() {
    return this.categoriesService.findAll(false);
  }

  @Post()
  @ApiOperation({ summary: 'Admin: Create a new service category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category code already exists' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update service category details' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.update(id, dto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin: Toggle service category active status' })
  @ApiResponse({
    status: 200,
    description: 'Category status updated successfully',
  })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.toggleStatus(id, dto.isActive, user);
  }
}
