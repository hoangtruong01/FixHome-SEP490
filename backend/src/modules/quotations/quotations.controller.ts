// src/modules/quotations/quotations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import {
  QuotationsService,
  CreateQuotationDto,
  CreateAdditionalCostDto,
} from './quotations.service';

@ApiTags('Quotations & Additional Costs')
@Controller()
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  // ── Quotations ──

  @Post('service-orders/:id/quotations')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('quotation:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Technician creates quotation for service order' })
  async createQuotation(
    @Param('id') orderId: string,
    @Body() dto: CreateQuotationDto,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const quotation = await this.quotationsService.createQuotation(
      orderId,
      dto,
      req.user,
    );
    return { data: quotation };
  }

  @Get('service-orders/:id/quotations')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('quotation:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all quotations for service order' })
  async getQuotations(@Param('id') orderId: string) {
    const quotations = await this.quotationsService.findByOrderId(orderId);
    return { data: quotations };
  }

  @Get('quotations/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('quotation:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quotation by ID' })
  async getQuotationById(@Param('id') id: string) {
    const quotation = await this.quotationsService.findById(id);
    return { data: quotation };
  }

  @Post('quotations/:id/decision')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer decides on quotation (APPROVE / REJECT)' })
  async decideQuotation(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const quotation = await this.quotationsService.decideQuotation(
      id,
      body.action,
      req.user,
    );
    return { data: quotation };
  }

  // ── Additional Costs ──

  @Post('service-orders/:id/additional-costs')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('additional_cost:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Technician requests additional costs (UNDER_REPAIR)' })
  async createAdditionalCost(
    @Param('id') orderId: string,
    @Body() dto: CreateAdditionalCostDto,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const request = await this.quotationsService.createAdditionalCost(
      orderId,
      dto,
      req.user,
    );
    return { data: request };
  }

  @Get('service-orders/:id/additional-costs')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get additional cost requests for service order' })
  async getAdditionalCosts(@Param('id') orderId: string) {
    const requests = await this.quotationsService.findAdditionalCostsByOrderId(orderId);
    return { data: requests };
  }

  @Post('additional-costs/:id/decision')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Customer decides on additional cost (APPROVE / REJECT)' })
  async decideAdditionalCost(
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const request = await this.quotationsService.decideAdditionalCost(
      id,
      body.action,
      req.user,
    );
    return { data: request };
  }

  @Post('additional-costs/:id/revise')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('additional_cost:revise')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Technician revises additional cost (creates new request supersedesId)',
  })
  async reviseAdditionalCost(
    @Param('id') id: string,
    @Body() dto: CreateAdditionalCostDto,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const revised = await this.quotationsService.reviseAdditionalCost(
      id,
      dto,
      req.user,
    );
    return { data: revised };
  }
}
