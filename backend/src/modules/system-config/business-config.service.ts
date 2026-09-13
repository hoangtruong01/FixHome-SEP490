// src/modules/system-config/business-config.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';

/**
 * P2.3: Business config service with 60s in-memory cache.
 * Service layer reads config via `getBusiness(key)` — never reads DB directly in loops,
 * never reads from .env for business values.
 */
@Injectable()
export class BusinessConfigService implements OnModuleInit {
  private readonly logger = new Logger(BusinessConfigService.name);
  private cache = new Map<string, string>();
  private cacheLoadedAt = 0;
  private static readonly CACHE_TTL_MS = 60_000; // 60s

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  /**
   * Get a business config value by key.
   * Returns the raw string value. Caller is responsible for parsing.
   */
  async get(key: string): Promise<string | null> {
    if (this.isCacheStale()) {
      await this.refreshCache();
    }
    return this.cache.get(key) ?? null;
  }

  /** Get an integer config value with a fallback default. */
  async getInt(key: string, defaultValue: number): Promise<number> {
    const raw = await this.get(key);
    if (raw === null) return defaultValue;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  /** Get a bigint config value (VND amounts — P3.4). */
  async getBigInt(key: string, defaultValue: bigint): Promise<bigint> {
    const raw = await this.get(key);
    if (raw === null) return defaultValue;
    try {
      return BigInt(raw);
    } catch {
      return defaultValue;
    }
  }

  /** Get a string config value with a fallback default. */
  async getString(key: string, defaultValue: string): Promise<string> {
    const raw = await this.get(key);
    return raw ?? defaultValue;
  }

  /**
   * Update a config value. Used by Admin config endpoint.
   * Invalidates cache immediately so next read gets fresh data.
   */
  async set(
    key: string,
    value: string,
    updatedByUserId: string,
  ): Promise<SystemConfig> {
    const config = await this.configRepo.findOneBy({ key });
    if (!config) {
      throw new Error(`Config key "${key}" not found`);
    }
    config.value = value;
    config.updatedByUserId = updatedByUserId;
    const saved = await this.configRepo.save(config);
    this.invalidateCache();
    return saved;
  }

  /** Get all configs (for admin UI). */
  async getAll(): Promise<SystemConfig[]> {
    return this.configRepo.find({ order: { key: 'ASC' } });
  }

  /** Force-refresh the cache (e.g., after role_permissions change). */
  invalidateCache(): void {
    this.cacheLoadedAt = 0;
  }

  private isCacheStale(): boolean {
    return (
      Date.now() - this.cacheLoadedAt > BusinessConfigService.CACHE_TTL_MS
    );
  }

  private async refreshCache(): Promise<void> {
    try {
      const configs = await this.configRepo.find();
      const newCache = new Map<string, string>();
      for (const c of configs) {
        newCache.set(c.key, c.value);
      }
      this.cache = newCache;
      this.cacheLoadedAt = Date.now();
      this.logger.debug(`Config cache refreshed: ${newCache.size} keys`);
    } catch (error) {
      this.logger.error('Failed to refresh config cache', error);
    }
  }
}
