// src/modules/health/health.service.ts
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async check() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!this.dataSource.isInitialized) throw new Error();
      await Promise.race([
        this.dataSource.query('SELECT 1'),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('Health timeout')), 5000);
        }),
      ]);
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    } finally {
      if (timer) clearTimeout(timer);
    }
    return {
      status: 'ok',
      service: 'fixhome-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      dependencies: { database: 'connected' },
    };
  }
}
