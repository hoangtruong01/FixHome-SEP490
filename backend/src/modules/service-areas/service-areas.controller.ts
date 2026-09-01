// src/modules/service-areas/service-areas.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceAreasService } from './service-areas.service';

// TODO: Implement endpoints:
// - GET  /service-areas
// - POST /service-areas
// - GET  /service-areas/:id

@ApiTags('Service Areas')
@Controller('service-areas')
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) {}

  // Skeleton only – endpoints will be implemented later
}
