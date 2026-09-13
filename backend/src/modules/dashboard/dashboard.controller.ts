// src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('customer')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('dashboard:read_own')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer dashboard metrics' })
  async getCustomerDashboard(@Req() req: { user: { id: string } }) {
    const data = await this.dashboardService.getCustomerDashboard(req.user.id);
    return { data };
  }

  @Get('technician')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('dashboard:read_own')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get technician dashboard metrics' })
  async getTechnicianDashboard(@Req() req: { user: { id: string } }) {
    const data = await this.dashboardService.getTechnicianDashboard(req.user.id);
    return { data };
  }

  @Get('operations')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('dashboard:read_operational')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get operations dashboard (Service Manager / Admin)' })
  async getOperationalDashboard() {
    const data = await this.dashboardService.getOperationalDashboard();
    return { data };
  }

  @Get('system')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('dashboard:read_system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform system dashboard (Admin)' })
  async getSystemDashboard() {
    const data = await this.dashboardService.getSystemDashboard();
    return { data };
  }
}
