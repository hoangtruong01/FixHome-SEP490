// src/modules/ai-diagnosis/dto/diagnosis-request.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiagnosisRequestDto {
  @ApiProperty({ description: 'Description of the problem provided by user' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Optional image URL showing the damaged equipment or area' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Optional service category hint from customer' })
  @IsOptional()
  @IsString()
  categoryHint?: string;
}
