import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateActiveStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}
