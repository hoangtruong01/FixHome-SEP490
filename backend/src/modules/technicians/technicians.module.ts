// src/modules/technicians/technicians.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';
import {
  TechnicianProfile,
  TechnicianSkill,
  TechnicianServiceArea,
  TechnicianSchedule,
  TechnicianTimeOff,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicianProfile,
      TechnicianSkill,
      TechnicianServiceArea,
      TechnicianSchedule,
      TechnicianTimeOff,
    ]),
  ],
  controllers: [TechniciansController],
  providers: [TechniciansService],
  exports: [TechniciansService, TypeOrmModule],
})
export class TechniciansModule {}

