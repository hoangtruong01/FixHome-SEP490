// src/common/guards/ownership.guard.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { OwnershipGuard } from './ownership.guard';

import { Role } from '../../shared/enums';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let reflector: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    };
    guard = new OwnershipGuard(reflector);
  });

  function createMockContext(user: any, reqData: any = {}) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          ...reqData,
        }),
      }),
    } as any;
  }

  it('allows access when no ownership param is configured', () => {
    reflector.getAllAndOverride.mockReturnValue(null);
    const ctx = createMockContext({ id: 'user-1', role: Role.CUSTOMER });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access for ADMIN regardless of param value', () => {
    reflector.getAllAndOverride.mockReturnValue('userId');
    const ctx = createMockContext(
      { id: 'admin-1', role: Role.ADMIN },
      { params: { userId: 'user-other' } },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when user owns the resource', () => {
    reflector.getAllAndOverride.mockReturnValue('userId');
    const ctx = createMockContext(
      { id: 'user-1', role: Role.CUSTOMER },
      { params: { userId: 'user-1' } },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws OWNERSHIP_DENIED (HTTP 404) when resource does not belong to user', () => {
    reflector.getAllAndOverride.mockReturnValue('userId');
    const ctx = createMockContext(
      { id: 'user-1', role: Role.CUSTOMER },
      { params: { userId: 'user-2' } },
    );

    try {
      guard.canActivate(ctx);
      expect.unreachable('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(BusinessException);
      expect((err.getResponse() as any).code).toBe(ErrorCodes.OWNERSHIP_DENIED);
      expect(err.getStatus()).toBe(404);
    }
  });
});
