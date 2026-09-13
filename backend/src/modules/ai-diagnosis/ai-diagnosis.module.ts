// src/modules/ai-diagnosis/ai-diagnosis.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiDiagnosisController } from './ai-diagnosis.controller';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AiDiagnosis } from './entities/ai-diagnosis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiDiagnosis]),
    HttpModule.register({
      timeout: 30000,
    }),
    ConfigModule,
  ],
  controllers: [AiDiagnosisController],
  providers: [AiDiagnosisService],
  exports: [AiDiagnosisService],
})
export class AiDiagnosisModule {}
