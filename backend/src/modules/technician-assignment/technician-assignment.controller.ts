// src/modules/technician-assignment/technician-assignment.controller.ts
import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { TechnicianAssignmentService } from './technician-assignment.service';

@ApiTags('Technician Assignment')
@Controller()
export class TechnicianAssignmentController {
  constructor(
    private readonly technicianAssignmentService: TechnicianAssignmentService,
  ) {}

  @Post('technicians/:id/assign')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('assignment:override')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Manually override / assign technician to a service order (SM, Admin)',
  })
  async assignTechnician(
    @Param('id') technicianId: string,
    @Body() body: { orderId: string; reason?: string },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const assignment = await this.technicianAssignmentService.overrideAssign(
      technicianId,
      body.orderId,
      req.user,
      body.reason,
    );
    return { data: assignment };
  }

  @Post('service-orders/:id/assign')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('assignment:override')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Assign technician to service order by order ID (SM, Admin)',
  })
  async assignByOrder(
    @Param('id') orderId: string,
    @Body() body: { technicianId: string; reason?: string },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const assignment = await this.technicianAssignmentService.overrideAssign(
      body.technicianId,
      orderId,
      req.user,
      body.reason,
    );
    return { data: assignment };
  }
}
