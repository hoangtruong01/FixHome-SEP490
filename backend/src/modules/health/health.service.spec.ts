import { describe, it, expect, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports only backend and database readiness', async () => {
    const service = new HealthService({
      isInitialized: true,
      query: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as DataSource);
    expect(await service.check()).toMatchObject({
      status: 'ok',
      dependencies: { database: 'connected' },
    });
  });
  it.each([false, true])(
    'returns 503 for unavailable database (initialized=%s)',
    async (isInitialized) => {
      const service = new HealthService({
        isInitialized,
        query: vi.fn().mockRejectedValue(new Error('private database detail')),
      } as unknown as DataSource);
      await expect(service.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
    },
  );
  it('bounds a stalled health query to five seconds', async () => {
    vi.useFakeTimers();
    try {
      const service = new HealthService({
        isInitialized: true,
        query: () => new Promise(() => {}),
      } as unknown as DataSource);
      const result = expect(service.check()).rejects.toThrow(
        ServiceUnavailableException,
      );
      await vi.advanceTimersByTimeAsync(5000);
      await result;
    } finally {
      vi.useRealTimers();
    }
  });
});
