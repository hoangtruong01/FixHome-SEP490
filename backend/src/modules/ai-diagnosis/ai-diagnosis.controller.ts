// src/modules/ai-diagnosis/ai-diagnosis.controller.ts
import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DiagnosisRequestDto, DiagnosisResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI Diagnosis')
@Controller()
export class AiDiagnosisController {
  constructor(private readonly aiDiagnosisService: AiDiagnosisService) {}

  @Post('ai-diagnosis/analyze')
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

  @Post('ai/diagnoses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Canonical endpoint for AI diagnosis (Advisory only)',
  })
  async analyzeCanonical(@Body() dto: DiagnosisRequestDto & { bookingId?: string; images?: string[] }, @Req() req?: any) {
    const userId = req?.user?.id;
    const result = await this.aiDiagnosisService.analyzeIssue(dto, userId);
    return { data: result };
  }

  @Get('ai/diagnoses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get saved AI diagnosis record by ID',
  })
  async getById(@Param('id') id: string) {
    const record = await this.aiDiagnosisService.findById(id);
    return { data: record };
  }
}
