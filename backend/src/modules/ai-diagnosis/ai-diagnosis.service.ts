// src/modules/ai-diagnosis/ai-diagnosis.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import {
  DiagnosisRequestDto,
  DiagnosisResponseDto,
  DiagnosisFallbackResponseDto,
  AIErrorCode,
} from './dto';

@Injectable()
export class AiDiagnosisService {
  private readonly logger = new Logger(AiDiagnosisService.name);
  private readonly aiServiceUrl: string;
  private readonly requestTimeoutMs = 15000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );
  }

  /**
   * Health check call to AI Service
   */
  async checkAiServiceHealth(): Promise<{ status: string; provider?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`).pipe(
          timeout(5000),
          catchError((err) => {
            throw err;
          }),
        ),
      );
      return {
        status: response.data?.status === 'ok' ? 'connected' : 'degraded',
        provider: response.data?.provider || 'unknown',
      };
    } catch (error) {
      this.logger.warn(`AI Service health check unreachable: ${error.message}`);
      return {
        status: 'disconnected',
        provider: 'none',
      };
    }
  }

  /**
   * Analyze home repair issue with graceful fallback.
   * Business rule: AI failure never blocks the customer from completing a booking.
   */
  async analyzeIssue(
    dto: DiagnosisRequestDto,
  ): Promise<DiagnosisResponseDto | DiagnosisFallbackResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post<DiagnosisResponseDto>(`${this.aiServiceUrl}/api/v1/diagnosis/analyze`, {
            description: dto.description,
            imageUrl: dto.imageUrl,
            categoryHint: dto.categoryHint,
          })
          .pipe(timeout(this.requestTimeoutMs)),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`AI Diagnosis call failed, using graceful fallback: ${error.message}`);

      // Graceful fallback response
      return {
        isFallback: true,
        errorCode: AIErrorCode.AI_PROVIDER_UNAVAILABLE,
        message:
          'Hệ thống AI chẩn đoán tạm thời bận hoặc không khả dụng. Bạn có thể tự chọn dịch vụ để tiếp tục.',
        fallbackAllowed: true,
      };
    }
  }
}
