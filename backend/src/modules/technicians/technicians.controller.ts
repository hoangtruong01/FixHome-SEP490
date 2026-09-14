// src/modules/technicians/technicians.controller.ts
import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TechniciansService, UpdateSkillPricingDto } from './technicians.service';

@ApiTags('Technicians')
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current technician profile' })
  async getMyProfile(@Req() req: { user: { id: string } }) {
    const profile = await this.techniciansService.getMyProfile(req.user.id);
    return { data: profile };
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current technician profile' })
  async updateMyProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: { bio?: string; isAvailable?: boolean; yearsExperience?: number },
  ) {
    const profile = await this.techniciansService.updateMyProfile(req.user.id, dto);
    return { data: profile };
  }

  @Get('me/services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current technician services & listed pricing' })
  async getMyServices(@Req() req: { user: { id: string } }) {
    const skills = await this.techniciansService.getMySkills(req.user.id);
    return { data: skills };
  }

  @Put('me/services/:serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set technician listed labor price & warranty for service' })
  async setSkillPricing(
    @Req() req: { user: { id: string } },
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateSkillPricingDto,
  ) {
    const skill = await this.techniciansService.setSkillPricing(req.user.id, serviceId, dto);
    return { data: skill };
  }
}
