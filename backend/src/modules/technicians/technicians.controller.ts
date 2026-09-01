// src/modules/technicians/technicians.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';

// TODO: Implement Technicians endpoints

@ApiTags('Technicians')
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  // Placeholder – implement when feature is requested
}
