// src/modules/bookings/invitations.controller.ts
import {
  Controller,
  Get,
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
import { InvitationsService } from './invitations.service';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invitation:respond')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my pending invitations (Technician inbox)' })
  async getMyInvitations(@Req() req: { user: { id: string } }) {
    const invitations = await this.invitationsService.getMyInvitations(
      req.user.id,
    );
    return { data: invitations };
  }

  @Post(':id/respond')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('invitation:respond')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to invitation (ACCEPT / DECLINE)' })
  async respond(
    @Param('id') id: string,
    @Body() body: { action: 'ACCEPT' | 'DECLINE' },
    @Req() req: { user: { id: string; role: string } },
  ) {
    const result = await this.invitationsService.respond(
      id,
      body.action,
      req.user,
    );
    return { data: result };
  }
}
