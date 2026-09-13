// src/modules/technician-verifications/dto/submit-verification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsInt,
  IsUrl,
  Matches,
  MaxLength,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { DocumentType } from '../../../shared/enums';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export class DocumentMetadataDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.CITIZEN_ID_FRONT })
  @IsEnum(DocumentType, {
    message: 'documentType must be a valid document type',
  })
  documentType: DocumentType;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/id_front.jpg',
  })
  @IsString()
  @IsNotEmpty({ message: 'fileUrl is required' })
  @IsUrl({ protocols: ['https'], require_protocol: true, disallow_auth: true })
  @Matches(
    /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/(image|raw)\/upload\//,
    { message: 'fileUrl must be a Cloudinary upload URL' },
  )
  @MaxLength(2048)
  fileUrl: string;

  @ApiProperty({ example: 'citizen_id_front.jpg' })
  @IsString()
  @IsNotEmpty({ message: 'fileName is required' })
  @MaxLength(255)
  @Matches(/^[\p{L}\p{N} _.-]+\.(jpe?g|png|webp|pdf)$/iu)
  fileName: string;

  @ApiProperty({
    example: 1048576,
    description: 'File size in bytes (max 10MB)',
  })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024, { message: 'fileSize cannot exceed 10MB' })
  fileSize: number;

  @ApiProperty({
    example: 'image/jpeg',
    enum: ALLOWED_MIME_TYPES,
    description:
      'Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf',
  })
  @IsString()
  @IsIn(ALLOWED_MIME_TYPES, {
    message:
      'mimeType must be one of image/jpeg, image/png, image/webp, application/pdf',
  })
  mimeType: string;
}

export class SubmitVerificationDto {
  @ApiProperty({
    type: [DocumentMetadataDto],
    description: 'List of verification document metadata',
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'At least one verification document is required',
  })
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => DocumentMetadataDto)
  documents: DocumentMetadataDto[];
}
