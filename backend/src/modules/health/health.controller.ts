// src/modules/health/health.controller.ts
import { Controller, Get, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AiDiagnosisService } from '../ai-diagnosis/ai-diagnosis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly aiDiagnosisService: AiDiagnosisService,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Comprehensive health check for backend, database, and AI service',
  })
  async check() {
    let dbStatus = 'uninitialized';
    try {
      if (this.dataSource?.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbStatus = 'connected';
      }
    } catch {
      dbStatus = 'disconnected';
    }

    const aiHealth = await this.aiDiagnosisService.checkAiServiceHealth();

    return {
      status: 'ok',
      service: 'fixhome-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        aiService: aiHealth,
      },
    };
  }
}
