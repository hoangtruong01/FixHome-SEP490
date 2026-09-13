// src/modules/rbac/rbac.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { UserScope } from './entities/user-scope.entity';

/**
 * D-18: Loads role→permission mappings from DB with 60s cache.
 * Guards use this service to check if a role has a specific permission.
 */
@Injectable()
export class RbacService implements OnModuleInit {
  private readonly logger = new Logger(RbacService.name);
  /** Map<roleCode, Set<permissionCode>> */
  private permissionMap = new Map<string, Set<string>>();
  private cacheLoadedAt = 0;
  private static readonly CACHE_TTL_MS = 60_000; // 60s

  constructor(
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    @InjectRepository(UserScope)
    private readonly scopeRepo: Repository<UserScope>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  /** Get regional scope for a user (used by ScopeGuard). */
  async getUserScope(userId: string): Promise<UserScope | null> {
    return this.scopeRepo.findOne({ where: { userId } });
  }

  /**
   * Check if a role has a specific permission.
   * Used by PermissionGuard.
   */
  async hasPermission(roleCode: string, permissionCode: string): Promise<boolean> {
    if (this.isCacheStale()) {
      await this.refreshCache();
    }
    const perms = this.permissionMap.get(roleCode);
    return perms?.has(permissionCode) ?? false;
  }

  /**
   * Get all permission codes for a role.
   * Used by GET /me to send permission list to the web client.
   */
  async getPermissionsForRole(roleCode: string): Promise<string[]> {
    if (this.isCacheStale()) {
      await this.refreshCache();
    }
    const perms = this.permissionMap.get(roleCode);
    return perms ? Array.from(perms) : [];
  }

  /** Force-refresh the cache (e.g., after seed or admin change). */
  invalidateCache(): void {
    this.cacheLoadedAt = 0;
  }

  private isCacheStale(): boolean {
    return Date.now() - this.cacheLoadedAt > RbacService.CACHE_TTL_MS;
  }

  private async refreshCache(): Promise<void> {
    try {
      const rows = await this.rpRepo.find({
        relations: ['role', 'permission'],
      });

      const newMap = new Map<string, Set<string>>();
      for (const row of rows) {
        const roleCode = row.role.code;
        const permCode = row.permission.code;
        if (!newMap.has(roleCode)) {
          newMap.set(roleCode, new Set());
        }
        newMap.get(roleCode)!.add(permCode);
      }

      this.permissionMap = newMap;
      this.cacheLoadedAt = Date.now();

      const totalMappings = rows.length;
      this.logger.debug(
        `RBAC cache refreshed: ${newMap.size} roles, ${totalMappings} role-permission mappings`,
      );
    } catch (error) {
      this.logger.error('Failed to refresh RBAC cache', error);
    }
  }
}
