// src/modules/service-orders/service-orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ServiceOrdersService } from './service-orders.service';
import {
  ServiceOrderStatus,
  EvidenceType,
} from '../../shared/enums';

@ApiTags('Service Orders')
@Controller()
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  // ── 1. Order Queries ──

  @Get('service-orders')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all service orders (SM / Admin board)' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: ServiceOrderStatus,
    @Query('search') search?: string,
  ) {
    const result = await this.serviceOrdersService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 20,
      status,
      search,
    });
    return { data: result.data, meta: { total: result.total } };
  }

  @Get('service-orders/my')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my service orders (Customer / Technician)' })
  async findMy(
    @Req() req: { user: { id: string; role: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: ServiceOrderStatus,
  ) {
    const result = await this.serviceOrdersService.findMyOrders(
      req.user.id,
      req.user.role,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: pageSize ? parseInt(pageSize, 10) : 20,
        status,
      },
    );
    return { data: result.data, meta: { total: result.total } };
  }

  @Get('service-orders/:id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service order by ID' })
  async findById(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const order = await this.serviceOrdersService.findById(id, req.user);
    return { data: order };
  }

  // ── 2. Order Lifecycle Transitions ──

  @Post('service-orders/:id/en-route')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:update_status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Technician transitions order to EN_ROUTE' })
  async enRoute(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const order = await this.serviceOrdersService.enRoute(id, req.user);
    return { data: order };
  }

  @Post('service-orders/:id/check-in')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('arrival_checkin:create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Technician arrival check-in with GPS verification' })
  async checkIn(
    @Param('id') id: string,
    @Body()
    body: {
      lat: number;
      lng: number;
      accuracyMeters: number;
      deviceInfo?: Record<string, unknown>;
    },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const checkIn = await this.serviceOrdersService.checkIn(id, body, req.user);
    return { data: checkIn };
  }

  @Post('service-orders/:id/evidence')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('evidence:upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload repair evidence (BEFORE / AFTER / ADDITIONAL)' })
  async uploadEvidence(
    @Param('id') id: string,
    @Body()
    body: {
      type: EvidenceType;
      mediaUrl: string;
      note?: string;
      capturedAt?: string;
    },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const evidence = await this.serviceOrdersService.uploadEvidence(
      id,
      body,
      req.user,
    );
    return { data: evidence };
  }

  @Post('service-orders/:id/start-repair')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:update_status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Start repair (requires valid check-in and BEFORE evidence)',
  })
  async startRepair(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const order = await this.serviceOrdersService.startRepair(id, req.user);
    return { data: order };
  }

  @Post('service-orders/:id/complete')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:update_status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete repair (requires AFTER evidence, generates invoice)',
  })
  async complete(
    @Param('id') id: string,
    @Body() body: { completionNote?: string },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const order = await this.serviceOrdersService.complete(
      id,
      body,
      req.user,
    );
    return { data: order };
  }

  @Post('service-orders/:id/cancel')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel service order with strike/compensation logic' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const order = await this.serviceOrdersService.cancel(
      id,
      body,
      req.user,
    );
    return { data: order };
  }

  // ── 3. Order Details & History ──

  @Get('service-orders/:id/status-history')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_status_history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order status history (D-22 timeline)' })
  async getStatusHistory(@Param('id') id: string) {
    const history = await this.serviceOrdersService.getStatusHistory(id);
    return { data: history };
  }

  @Get('service-orders/:id/invoice')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invoice:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice for service order' })
  async getInvoice(@Param('id') id: string) {
    const invoice = await this.serviceOrdersService.getInvoice(id);
    return { data: invoice };
  }

  @Post('invoices/:id/pay')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invoice:pay_own')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pay invoice (DEMO mode)' })
  async payInvoice(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: string } },
  ) {
    const invoice = await this.serviceOrdersService.payInvoice(id, req.user);
    return { data: invoice };
  }

  @Get('service-orders/:id/warranties')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('warranty:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warranty coverages for service order' })
  async getWarranties(@Param('id') id: string) {
    const warranties = await this.serviceOrdersService.getWarranties(id);
    return { data: warranties };
  }

  // ── 4. Repair History (D-20 Read Model) ──

  @Get('repair-history')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('history:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get repair history (D-20 derived read model)' })
  async getRepairHistory(
    @Req() req: { user: { id: string; role: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.serviceOrdersService.getRepairHistory(
      req.user.id,
      req.user.role,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: pageSize ? parseInt(pageSize, 10) : 20,
      },
    );
    return { data: result.data, meta: { total: result.total } };
  }

  // ── 5. Operations: Cancellations & Strikes ──

  @Get('cancellations')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('order:read_related')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cancellations for SM/Admin review' })
  async getCancellations(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.serviceOrdersService.getCancellations({
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { data: result.data, meta: { total: result.total } };
  }

  @Post('cancellations/:id/review')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('compensation:decide')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review cancellation: waive strike, decide compensation' })
  async reviewCancellation(
    @Param('id') id: string,
    @Body()
    body: {
      waiveStrike?: boolean;
      waiveReason?: string;
      compensationDecision?: 'GRANTED' | 'REJECTED';
    },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const cancellation = await this.serviceOrdersService.reviewCancellation(
      id,
      body,
      req.user,
    );
    return { data: cancellation };
  }

  @Get('strikes')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('strike:read_all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List cancellation strikes (SM / Admin)' })
  async getStrikes(
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.serviceOrdersService.getStrikes({
      userId,
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return { data: result.data, meta: { total: result.total } };
  }

  @Post('strikes/:id/waive')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('strike:waive')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Waive cancellation strike (SM / Admin)' })
  async waiveStrike(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const strike = await this.serviceOrdersService.waiveStrike(
      id,
      body,
      req.user,
    );
    return { data: strike };
  }
}
