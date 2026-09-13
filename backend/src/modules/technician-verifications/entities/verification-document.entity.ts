// src/modules/technician-verifications/entities/verification-document.entity.ts
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { DocumentType } from '../../../shared/enums';
import { TechnicianVerification } from './technician-verification.entity';

@Entity('verification_documents')
@Index(['verificationId'])
export class VerificationDocument extends BaseEntity {
  @Column({ name: 'verification_id', type: 'uuid' })
  verificationId: string;

  @ManyToOne(() => TechnicianVerification, (v) => v.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'verification_id' })
  verification: TechnicianVerification;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Column({ name: 'file_url', type: 'varchar' })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar' })
  fileName: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'varchar' })
  mimeType: string;
}
