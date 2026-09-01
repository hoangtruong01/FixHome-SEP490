// src/modules/technician-assignment/technician-assignment.module.ts
import { Module } from '@nestjs/common';
import { TechnicianAssignmentController } from './technician-assignment.controller';
import { TechnicianAssignmentService } from './technician-assignment.service';

@Module({
  controllers: [TechnicianAssignmentController],
  providers: [TechnicianAssignmentService],
  exports: [TechnicianAssignmentService],
})
export class TechnicianAssignmentModule {}
