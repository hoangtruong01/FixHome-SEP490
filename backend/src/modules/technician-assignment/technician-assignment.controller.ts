// src/modules/technician-assignment/technician-assignment.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TechnicianAssignmentService } from './technician-assignment.service';

// TODO: Implement endpoints:
// - POST /technician-assignment/assign
// - POST /technician-assignment/reassign
// - GET  /technician-assignment/suggestions/:orderId

@ApiTags('Technician Assignment')
@Controller('technician-assignment')
export class TechnicianAssignmentController {
  constructor(
    private readonly technicianAssignmentService: TechnicianAssignmentService,
  ) {}

  // Skeleton only – endpoints will be implemented later
}
