// src/modules/service-orders/service-orders.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceOrdersService } from './service-orders.service';

// TODO: Implement ServiceOrders endpoints

@ApiTags('ServiceOrders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  // Placeholder – implement when feature is requested
}
