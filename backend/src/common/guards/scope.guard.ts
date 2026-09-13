// src/common/guards/scope.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { RbacService } from '../../modules/rbac/rbac.service';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import { Role } from '../../shared/enums';

/**
 * P5.1 Layer 4: ScopeGuard (SM user_scopes)
 * Implements OPEN-SM-01: Validates Service Manager regional scope.
 * If scope is GLOBAL -> unrestricted.
 * If scoped to specific provinces -> blocks actions on other provinces.
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) return true;

    // Only Service Managers have regional scoping
    if (user.role !== Role.SERVICE_MANAGER) {
      return true;
    }

    const scope = await this.rbacService.getUserScope(user.id);
    if (!scope || scope.scopeType === 'GLOBAL') {
      return true;
    }

    const requestedProvince =
      req.params?.provinceCode ??
      req.query?.provinceCode ??
      req.body?.provinceCode ??
      req.body?.province;

    if (
      requestedProvince &&
      scope.scopeProvinceCodes &&
      !scope.scopeProvinceCodes.includes(requestedProvince)
    ) {
      throw new BusinessException(
        ErrorCodes.RBAC_FORBIDDEN,
        `Action rejected: province "${requestedProvince}" is outside your assigned scope`,
      );
    }

    return true;
  }
}
