// src/common/decorators/require-permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';

/**
 * D-18: Decorator to require a specific DB-backed permission.
 * Used instead of `@Roles()` for fine-grained access control.
 *
 * Usage:
 *   @RequirePermission('booking:create')
 *   @RequirePermission('config:update')
 *
 * The PermissionGuard reads this metadata and checks against the DB-backed
 * role→permission mapping via RbacService.
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
