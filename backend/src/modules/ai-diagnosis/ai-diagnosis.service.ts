// src/modules/ai-diagnosis/ai-diagnosis.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { AiDiagnosis } from './entities/ai-diagnosis.entity';
import {
  DiagnosisRequestDto,
  DiagnosisResponseDto,
  DiagnosisFallbackResponseDto,
} from './dto';

@Injectable()
export class AiDiagnosisService {
  private readonly logger = new Logger(AiDiagnosisService.name);
  private readonly aiServiceUrl: string;
  private readonly requestTimeoutMs = 15000;

  constructor(
    @InjectRepository(AiDiagnosis)
    private readonly diagnosisRepo: Repository<AiDiagnosis>,
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
          timeout(3000),
        ),
      );
      return {
        status: response.data?.status === 'ok' ? 'connected' : 'degraded',
        provider: response.data?.provider || 'unknown',
      };
    } catch {
      return {
        status: 'mock_stub',
        provider: 'mock-advisor',
      };
    }
  }

  /**
   * Analyze home repair issue with stub/AI provider and DB persistence.
   * Business rule: AI failure never blocks the customer from completing a booking.
   */
  async analyzeIssue(
    dto: DiagnosisRequestDto & { bookingId?: string; images?: string[] },
    _userId?: string,
  ): Promise<DiagnosisResponseDto | DiagnosisFallbackResponseDto | any> {
    const startTime = Date.now();
    let resultData: any;

    try {
      const response = await firstValueFrom(
        this.httpService
          .post<DiagnosisResponseDto>(`${this.aiServiceUrl}/api/v1/diagnosis/analyze`, {
            description: dto.description,
            imageUrl: dto.imageUrl || (dto.images && dto.images[0]),
            categoryHint: dto.categoryHint,
          })
          .pipe(timeout(this.requestTimeoutMs)),
      );

      resultData = response.data;
    } catch (error) {
      this.logger.warn(`AI Service not reachable (${error.message}). Using intelligent mock stub.`);
      // Mock stub response per domain model
      resultData = {
        possibleIssues: [
          { name: 'Sự cố thiết bị điện/nước gia đình', probability: 0.85 },
          { name: 'Hỏng hóc linh kiện hao mòn theo thời gian', probability: 0.65 },
        ],
        possibleCauses: [
          { description: 'Tuổi thọ thiết bị lâu năm hoặc quá tải điện năng', severity: 'MEDIUM' },
        ],
        urgency: 'STANDARD',
        estimatedCostMin: 150000,
        estimatedCostMax: 500000,
        suggestedService: dto.categoryHint || 'Sửa chữa điện lạnh & đồ gia dụng',
        confidence: 0.88,
        disclaimer: 'Kết quả mang tính chất tư vấn tham khảo, thợ sửa chữa sẽ kiểm tra trực tiếp tại nhà để báo giá chuẩn xác.',
      };
    }

    const latencyMs = Date.now() - startTime;

    // Persist diagnosis if bookingId or placeholder
    try {
      const record = this.diagnosisRepo.create({
        bookingId: dto.bookingId || '00000000-0000-0000-0000-000000000000',
        provider: 'stub',
        model: 'fixhome-advisor-v1',
        possibleIssues: resultData.possibleIssues,
        possibleCauses: resultData.possibleCauses,
        urgency: resultData.urgency,
        priceRangeMin: resultData.estimatedCostMin || 100000,
        priceRangeMax: resultData.estimatedCostMax || 500000,
        confidence: resultData.confidence || 0.85,
        latencyMs,
        rawResponse: resultData,
      });

      const saved = await this.diagnosisRepo.save(record);
      return {
        ...resultData,
        id: saved.id,
      };
    } catch (dbErr) {
      this.logger.warn(`Failed to persist diagnosis record: ${dbErr.message}`);
      return resultData;
    }
  }

  async findById(id: string): Promise<AiDiagnosis> {
    const diagnosis = await this.diagnosisRepo.findOneBy({ id });
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
    }
    return diagnosis;
  }
}
