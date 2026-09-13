// src/modules/technician-verifications/technician-verifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianVerificationsController } from './technician-verifications.controller';
import { AdminTechnicianVerificationsController } from './admin-technician-verifications.controller';
import { TechnicianVerificationsService } from './technician-verifications.service';
import { TechnicianVerification } from './entities/technician-verification.entity';
import { VerificationDocument } from './entities/verification-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TechnicianVerification, VerificationDocument]),
  ],
  controllers: [
    TechnicianVerificationsController,
    AdminTechnicianVerificationsController,
  ],
  providers: [TechnicianVerificationsService],
  exports: [TechnicianVerificationsService, TypeOrmModule],
})
export class TechnicianVerificationsModule {}
