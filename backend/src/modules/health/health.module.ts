// src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AiDiagnosisModule } from '../ai-diagnosis/ai-diagnosis.module';

@Module({
  imports: [AiDiagnosisModule],
  controllers: [HealthController],
})
export class HealthModule {}
