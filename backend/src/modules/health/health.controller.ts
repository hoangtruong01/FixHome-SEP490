// src/modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get(['health', 'api/v1/health'])
  @ApiOperation({
    summary:
      'Platform health check for backend liveness and database connectivity',
  })
  check() {
    return this.healthService.check();
  }
}
