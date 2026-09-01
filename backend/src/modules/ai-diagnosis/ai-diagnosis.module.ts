// src/modules/ai-diagnosis/ai-diagnosis.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiDiagnosisController } from './ai-diagnosis.controller';
import { AiDiagnosisService } from './ai-diagnosis.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30s timeout for AI service calls
    }),
    ConfigModule,
  ],
  controllers: [AiDiagnosisController],
  providers: [AiDiagnosisService],
  exports: [AiDiagnosisService],
})
export class AiDiagnosisModule {}
