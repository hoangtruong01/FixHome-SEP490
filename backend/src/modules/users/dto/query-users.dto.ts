import { MaxLength } from 'class-validator';
// src/modules/users/dto/query-users.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/dto';
import { Role, AccountStatus } from '../../../shared/enums';

export class QueryUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search term for name, email, or phone' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Filter by user role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    enum: AccountStatus,
    description: 'Filter by account status',
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}
