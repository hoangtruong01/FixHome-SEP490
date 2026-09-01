// src/modules/quotations/quotations.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';

// TODO: Implement Quotations endpoints

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  // Placeholder – implement when feature is requested
}
