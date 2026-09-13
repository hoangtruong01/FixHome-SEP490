// src/modules/technician-verifications/technician-verifications.service.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { TechnicianVerificationsService } from './technician-verifications.service';
import { TechnicianVerification } from './entities/technician-verification.entity';
import { VerificationStatus, DocumentType } from '../../shared/enums';
import { Role, AccountStatus } from '../../shared/enums';
import { User } from '../users/entities/user.entity';
import { VerificationDocument } from './entities/verification-document.entity';
import { ConfigService } from '@nestjs/config';

describe('TechnicianVerificationsService', () => {
  let verificationsService: TechnicianVerificationsService;
  let verificationRepository: any;
  let documentRepository: any;

  const mockVerification: TechnicianVerification = {
    id: 'verif-uuid-1',
    technicianId: 'tech-uuid-1',
    technician: {} as any,
    status: VerificationStatus.PENDING,
    submittedAt: new Date(),
    reviewedAt: null,
    reviewedById: null,
    reviewedBy: null,
    rejectionReason: null,
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    verificationRepository = {
      findOne: vi.fn(),
      create: vi
        .fn()
        .mockImplementation((d) => ({ ...mockVerification, ...d })),
      save: vi.fn().mockImplementation((d) => Promise.resolve({ ...d })),
      createQueryBuilder: vi.fn().mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[mockVerification], 1]),
      }),
    };

    documentRepository = {
      create: vi.fn().mockImplementation((d) => ({ id: 'doc-uuid', ...d })),
      save: vi.fn().mockImplementation((d) => Promise.resolve(d)),
    };

    verificationRepository.update = vi.fn(async (_criteria, changes) => {
      const current = await verificationRepository.findOne();
      if (current.status !== VerificationStatus.PENDING) return { affected: 0 };
      verificationRepository.findOne.mockResolvedValue({
        ...current,
        ...changes,
      });
      return { affected: 1 };
    });
    const users = {
      findOne: vi
        .fn()
        .mockResolvedValue({
          role: Role.TECHNICIAN,
          status: AccountStatus.ACTIVE,
          isActive: true,
        }),
    };
    const manager = {
      getRepository: (entity: unknown) =>
        entity === User
          ? users
          : entity === VerificationDocument
            ? documentRepository
            : verificationRepository,
    };
    verificationRepository.manager = {
      transaction: (fn: (m: typeof manager) => unknown) => fn(manager),
    };

    verificationsService = new TechnicianVerificationsService(
      verificationRepository,
      { get: () => 'audit-test' } as unknown as ConfigService,
    );
  });

  describe('submitVerification', () => {
    it('submits verification request with document metadata successfully', async () => {
      verificationRepository.findOne.mockResolvedValue(null);

      const result = await verificationsService.submitVerification(
        'tech-uuid-1',
        {
          documents: [
            {
              documentType: DocumentType.CITIZEN_ID_FRONT,
              fileUrl:
                'https://res.cloudinary.com/audit-test/image/upload/id_front.jpg',
              fileName: 'id_front.jpg',
              fileSize: 500000,
              mimeType: 'image/jpeg',
            },
          ],
        },
      );

      expect(result.status).toBe(VerificationStatus.PENDING);
      expect(result.technicianId).toBe('tech-uuid-1');
      expect(documentRepository.save).toHaveBeenCalled();
    });

    it('rejects submission if a request is already PENDING', async () => {
      verificationRepository.findOne.mockResolvedValueOnce(mockVerification);

      await expect(
        verificationsService.submitVerification('tech-uuid-1', {
          documents: [
            {
              documentType: DocumentType.CITIZEN_ID_FRONT,
              fileUrl:
                'https://res.cloudinary.com/audit-test/image/upload/id_front.jpg',
              fileName: 'id_front.jpg',
              fileSize: 500000,
              mimeType: 'image/jpeg',
            },
          ],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects submission if technician is already APPROVED', async () => {
      verificationRepository.findOne
        .mockResolvedValueOnce(null) // pending check
        .mockResolvedValueOnce({
          ...mockVerification,
          status: VerificationStatus.APPROVED,
        }); // approved check

      await expect(
        verificationsService.submitVerification('tech-uuid-1', {
          documents: [
            {
              documentType: DocumentType.CITIZEN_ID_FRONT,
              fileUrl:
                'https://res.cloudinary.com/audit-test/image/upload/id_front.jpg',
              fileName: 'id_front.jpg',
              fileSize: 500000,
              mimeType: 'image/jpeg',
            },
          ],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('approveVerification', () => {
    it('approves verification request and records audit fields', async () => {
      verificationRepository.findOne.mockResolvedValue({
        ...mockVerification,
        status: VerificationStatus.PENDING,
      });

      const result = await verificationsService.approveVerification(
        'verif-uuid-1',
        'admin-uuid-1',
      );

      expect(result.status).toBe(VerificationStatus.APPROVED);
      expect(result.reviewedById).toBe('admin-uuid-1');
      expect(result.reviewedAt).toBeInstanceOf(Date);
      expect(result.rejectionReason).toBeNull();
    });

    it('throws ConflictException if already approved', async () => {
      verificationRepository.findOne.mockResolvedValue({
        ...mockVerification,
        status: VerificationStatus.APPROVED,
      });

      await expect(
        verificationsService.approveVerification(
          'verif-uuid-1',
          'admin-uuid-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('rejectVerification', () => {
    it('rejects verification request with reason', async () => {
      verificationRepository.findOne.mockResolvedValue({
        ...mockVerification,
        status: VerificationStatus.PENDING,
      });

      const result = await verificationsService.rejectVerification(
        'verif-uuid-1',
        'admin-uuid-1',
        { rejectionReason: 'ID card image is blurry' },
      );

      expect(result.status).toBe(VerificationStatus.REJECTED);
      expect(result.rejectionReason).toBe('ID card image is blurry');
      expect(result.reviewedById).toBe('admin-uuid-1');
    });

    it('throws ConflictException if already rejected', async () => {
      verificationRepository.findOne.mockResolvedValue({
        ...mockVerification,
        status: VerificationStatus.REJECTED,
      });

      await expect(
        verificationsService.rejectVerification(
          'verif-uuid-1',
          'admin-uuid-1',
          {
            rejectionReason: 'Already rejected',
          },
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
