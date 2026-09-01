// src/modules/dashboard/dashboard.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

// TODO: Implement endpoints:
// - GET /dashboard/admin
// - GET /dashboard/manager
// - GET /dashboard/technician

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Skeleton only – endpoints will be implemented later
}
