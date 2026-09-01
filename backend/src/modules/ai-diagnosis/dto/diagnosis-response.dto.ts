// src/modules/ai-diagnosis/dto/diagnosis-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum AIErrorCode {
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
  INVALID_IMAGE = 'INVALID_IMAGE',
  UNSUPPORTED_IMAGE = 'UNSUPPORTED_IMAGE',
  INSUFFICIENT_INFORMATION = 'INSUFFICIENT_INFORMATION',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
}

export class EstimatedCostDto {
  @ApiProperty({ example: 100000 })
  min: number;

  @ApiProperty({ example: 300000 })
  max: number;

  @ApiProperty({ example: 'VND' })
  currency: string;
}

export class DiagnosisResponseDto {
  @ApiProperty({ type: [String], description: 'Detected potential issues' })
  possibleIssues: string[];

  @ApiProperty({ type: [String], description: 'Possible root causes' })
  possibleCauses: string[];

  @ApiProperty({ enum: UrgencyLevel, description: 'Urgency level' })
  urgency: UrgencyLevel;

  @ApiProperty({ type: EstimatedCostDto, description: 'Estimated cost range' })
  estimatedCost: EstimatedCostDto;

  @ApiProperty({ type: [String], description: 'Suggested immediate actions' })
  suggestedActions: string[];

  @ApiPropertyOptional({ description: 'Recommended service ID' })
  recommendedServiceId?: string | null;

  @ApiProperty({ example: 0.85, description: 'AI confidence score (0.0 to 1.0)' })
  confidence: number;

  @ApiProperty({ example: false, description: 'Flag indicating if confidence is below threshold' })
  isLowConfidence: boolean;

  @ApiProperty({
    example: 'Kết quả AI chỉ mang tính tham khảo sơ bộ, không phải kết luận kỹ thuật tuyệt đối.',
    description: 'Advisory disclaimer',
  })
  disclaimer: string;
}

export class DiagnosisFallbackResponseDto {
  @ApiProperty({ example: true })
  isFallback: boolean;

  @ApiProperty({ enum: AIErrorCode })
  errorCode: AIErrorCode;

  @ApiProperty({ example: 'AI chẩn đoán tạm thời không khả dụng. Quý khách vui lòng chọn danh mục dịch vụ trực tiếp.' })
  message: string;

  @ApiProperty({ example: true })
  fallbackAllowed: boolean;
}
