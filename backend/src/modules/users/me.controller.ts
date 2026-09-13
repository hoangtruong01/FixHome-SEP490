// src/modules/users/me.controller.ts
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { UserProfileDto } from '../auth/dto';
import { RbacService } from '../rbac/rbac.service';

@ApiTags('Me')
@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user profile with permissions (used by web to render menu)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile with permission list',
    type: UserProfileDto,
  })
  async getMyProfile(@CurrentUser('id') userId: string): Promise<UserProfileDto> {
    const user = await this.usersService.getProfile(userId);
    const permissions = await this.rbacService.getPermissionsForRole(user.role);
    return UserProfileDto.fromUser(user, permissions);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update current user profile (fullName, phoneNumber, avatarUrl)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Phone number already registered by another account',
  })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.updateProfile(userId, dto);
    const permissions = await this.rbacService.getPermissionsForRole(user.role);
    return UserProfileDto.fromUser(user, permissions);
  }
}
