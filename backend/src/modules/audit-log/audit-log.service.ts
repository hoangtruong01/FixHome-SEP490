// src/modules/audit-log/audit-log.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditEntry {
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Programmatic audit logging service.
 * P10.1 #10: Required for lock user, assign override, config changes,
 * cancellations, waive strike, price changes.
 *
 * Usage:
 *   await this.auditService.log({
 *     actorUserId: user.id,
 *     actorRole: user.role,
 *     action: 'CONFIG_UPDATE',
 *     resourceType: 'system_config',
 *     resourceId: key,
 *     before: { value: oldValue },
 *     after: { value: newValue },
 *   });
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /** Record an audit log entry. Never throws — logs error internally. */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.auditRepo.insert({
        actorUserId: entry.actorUserId,
        actorRole: entry.actorRole,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        before: entry.before ?? null,
        after: entry.after ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      });
    } catch (error) {
      // Audit logging must never crash the business operation
      this.logger.error(
        `Failed to record audit: ${entry.action} on ${entry.resourceType}`,
        error,
      );
    }
  }

  /**
   * Log within an existing transaction (e.g., inside state transitions — D-22).
   * Caller provides the EntityManager from their transaction.
   */
  async logWithManager(
    manager: import('typeorm').EntityManager,
    entry: AuditEntry,
  ): Promise<void> {
    try {
      await manager.insert(AuditLog, {
        actorUserId: entry.actorUserId,
        actorRole: entry.actorRole,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        before: entry.before ?? null,
        after: entry.after ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      });
    } catch (error) {
      this.logger.error(
        `Failed to record transactional audit: ${entry.action} on ${entry.resourceType}`,
        error,
      );
    }
  }

  /** Query audit logs (for admin UI). */
  async findAll(options: {
    page: number;
    limit: number;
    resourceType?: string;
    actorUserId?: string;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const qb = this.auditRepo.createQueryBuilder('log');

    if (options.resourceType) {
      qb.andWhere('log.resourceType = :resourceType', {
        resourceType: options.resourceType,
      });
    }
    if (options.actorUserId) {
      qb.andWhere('log.actorUserId = :actorUserId', {
        actorUserId: options.actorUserId,
      });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
