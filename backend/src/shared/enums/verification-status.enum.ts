// src/shared/enums/verification-status.enum.ts
export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DocumentType {
  CITIZEN_ID_FRONT = 'citizen_id_front',
  CITIZEN_ID_BACK = 'citizen_id_back',
  CERTIFICATE = 'certificate',
  PORTFOLIO = 'portfolio',
  OTHER = 'other',
}
