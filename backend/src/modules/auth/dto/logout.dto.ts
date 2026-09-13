import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description:
      'Omit to revoke all sessions; supply a token to revoke only its owned session.',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  refreshToken?: string;
}
