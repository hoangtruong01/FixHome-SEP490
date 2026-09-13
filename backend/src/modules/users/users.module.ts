// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { MeController } from './me.controller';
import { AddressesController } from './addresses.controller';
import { UsersService } from './users.service';
import { AddressesService } from './addresses.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, RefreshToken])],
  controllers: [
    MeController,
    AddressesController,
    UsersController,
    AdminUsersController,
  ],
  providers: [UsersService, AddressesService],
  exports: [UsersService, AddressesService, TypeOrmModule],
})
export class UsersModule {}

