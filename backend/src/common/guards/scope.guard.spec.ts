// src/common/guards/scope.guard.spec.ts
import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ScopeGuard } from './scope.guard';
import { Role } from '../../shared/enums';
import { BusinessException } from '../exceptions/business.exception';

describe('ScopeGuard', () => {
  let guard: ScopeGuard;
  let rbacService: any;

  beforeEach(() => {
    rbacService = {
      getUserScope: vi.fn(),
    };
    guard = new ScopeGuard(rbacService);
  });

  function createMockContext(user: any, reqData: any = {}) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          ...reqData,
        }),
      }),
    } as any;
  }

  it('allows access for ADMIN without scope check', async () => {
    const ctx = createMockContext({ id: 'admin-1', role: Role.ADMIN });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(rbacService.getUserScope).not.toHaveBeenCalled();
  });

  it('allows access for CUSTOMER without scope check', async () => {
    const ctx = createMockContext({ id: 'cust-1', role: Role.CUSTOMER });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('allows access for SM with GLOBAL scope', async () => {
    rbacService.getUserScope.mockResolvedValue({ scopeType: 'GLOBAL' });
    const ctx = createMockContext({ id: 'sm-1', role: Role.SERVICE_MANAGER });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('allows access for SM with REGIONAL scope matching province', async () => {
    rbacService.getUserScope.mockResolvedValue({
      scopeType: 'REGIONAL',
      scopeProvinceCodes: ['79', '01'],
    });
    const ctx = createMockContext(
      { id: 'sm-1', role: Role.SERVICE_MANAGER },
      { query: { provinceCode: '79' } },
    );
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('throws BusinessException for SM when province is outside scope', async () => {
    rbacService.getUserScope.mockResolvedValue({
      scopeType: 'REGIONAL',
      scopeProvinceCodes: ['01'],
    });
    const ctx = createMockContext(
      { id: 'sm-1', role: Role.SERVICE_MANAGER },
      { query: { provinceCode: '79' } },
    );
    await expect(guard.canActivate(ctx)).rejects.toThrow(BusinessException);
  });
});
