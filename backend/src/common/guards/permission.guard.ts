// src/common/guards/permission.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { RbacService } from '../../modules/rbac/rbac.service';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';

/**
 * D-18 / P5.1: Permission guard that reads permissions from DB.
 * Replaces `if (user.role === 'ADMIN')` checks scattered in services.
 *
 * This is the second layer in the 5-layer guard chain:
 *   JwtGuard → PermissionGuard → OwnershipGuard → ScopeGuard → StateMachineGuard
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission decorator → allow (other guards may still block)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new BusinessException(
        ErrorCodes.RBAC_FORBIDDEN,
        'Authentication required',
      );
    }

    // Check if the user's role has ANY of the required permissions
    for (const permission of requiredPermissions) {
      const has = await this.rbacService.hasPermission(user.role, permission);
      if (has) {
        return true;
      }
    }

    throw new BusinessException(
      ErrorCodes.RBAC_FORBIDDEN,
      'You do not have permission to perform this action',
    );
  }
}
