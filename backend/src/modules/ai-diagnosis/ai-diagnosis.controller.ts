// src/modules/ai-diagnosis/ai-diagnosis.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DiagnosisRequestDto, DiagnosisResponseDto } from './dto';

@ApiTags('AI Diagnosis')
@Controller('ai-diagnosis')
export class AiDiagnosisController {
  constructor(private readonly aiDiagnosisService: AiDiagnosisService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit description and image for AI diagnosis (Advisory only)',
  })
  @ApiResponse({
    status: 200,
    description: 'AI Diagnosis analysis or graceful fallback result',
    type: DiagnosisResponseDto,
  })
  async analyze(@Body() dto: DiagnosisRequestDto) {
    return this.aiDiagnosisService.analyzeIssue(dto);
  }
}
