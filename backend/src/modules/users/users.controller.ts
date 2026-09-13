// src/modules/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto, UpdateProfileDto, UpdateUserStatusDto } from './dto';
import { JwtAuthGuard, PermissionGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, RequirePermission, Roles } from '../../common/decorators';
import { Role } from '../../shared/enums';
import { UserProfileDto } from '../auth/dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: UserProfileDto,
  })
  async getMyProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.getProfile(userId);
    return UserProfileDto.fromUser(user);
  }

  @Patch('me')
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
  ) {
    const user = await this.usersService.updateProfile(userId, dto);
    return UserProfileDto.fromUser(user);
  }

  @Get()
  @Roles(Role.SERVICE_MANAGER, Role.ADMIN)
  @RequirePermission('user:read_all')
  @ApiOperation({ summary: 'SM/Admin: Filter and paginate users' })
  @ApiResponse({
    status: 200,
    description: 'Paginated user list fetched successfully',
  })
  async findUsers(@Query() query: QueryUsersDto) {
    const { data, meta } = await this.usersService.findUsers(query);
    return {
      data: data.map((u) => UserProfileDto.fromUser(u)),
      meta,
    };
  }

  @Get(':id')
  @Roles(Role.SERVICE_MANAGER, Role.ADMIN)
  @RequirePermission('user:read_all')
  @ApiOperation({ summary: 'SM/Admin: Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details fetched successfully',
    type: UserProfileDto,
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.getUserById(id);
    return UserProfileDto.fromUser(user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @RequirePermission('user:lock')
  @ApiOperation({
    summary: 'Admin: Update user status (ACTIVE, LOCKED, SUSPENDED) with audit',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: UserProfileDto,
  })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.usersService.updateUserStatus(id, dto, {
      id: currentUser.id,
      role: currentUser.role,
    });
    return UserProfileDto.fromUser(user);
  }
}

