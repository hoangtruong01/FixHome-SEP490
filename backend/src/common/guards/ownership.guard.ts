// src/common/guards/ownership.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCodes } from '../../shared/constants';
import { Role } from '../../shared/enums';

export const OWNERSHIP_PARAM_KEY = 'ownership_param_key';

/**
 * Decorator to declare which route param must match the authenticated user id.
 * e.g. @RequireOwnership('userId') or @RequireOwnership('customerId')
 */
export const RequireOwnership = (paramName = 'userId') =>
  Reflector.createDecorator<string>()(paramName);

/**
 * P5.1 Layer 3: OwnershipGuard
 * Ensures the resource belongs to the current actor.
 * If user is ADMIN or SERVICE_MANAGER, ownership check is bypassed.
 * Otherwise, if param != user.id, throws OWNERSHIP_DENIED (HTTP 404 per P4.2 to prevent ID probing).
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredParam = this.reflector.getAllAndOverride<string>(
      OWNERSHIP_PARAM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredParam) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) return true;

    // Admin and Service Manager can access across users
    if (user.role === Role.ADMIN || user.role === Role.SERVICE_MANAGER) {
      return true;
    }

    const resourceOwnerId = req.params?.[requiredParam] ?? req.body?.[requiredParam];
    if (resourceOwnerId && resourceOwnerId !== user.id) {
      throw new BusinessException(
        ErrorCodes.OWNERSHIP_DENIED,
        'Resource not found',
      );
    }

    return true;
  }
}
