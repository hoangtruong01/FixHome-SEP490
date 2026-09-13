// src/config/env.validation.spec.ts
import { describe, expect, it } from 'vitest';
import { Environment, validate } from './env.validation';

describe('Environment Validation', () => {
  const validConfig = {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_HOST: 'localhost',
    DATABASE_PORT: 5432,
    DATABASE_NAME: 'fixhome',
    DATABASE_USER: 'postgres',
    DATABASE_PASSWORD: 'postgres_password',
    JWT_ACCESS_SECRET: 'test-only-access-secret-with-32-characters',
    JWT_REFRESH_SECRET: 'test-only-refresh-secret-with-32-characters',
  };

  it('validates a correct environment configuration', () => {
    const config = validate(validConfig);
    expect(config.NODE_ENV).toBe(Environment.Test);
    expect(config.PORT).toBe(3000);
    expect(config.DATABASE_HOST).toBe('localhost');
    expect(config.DATABASE_PASSWORD).toBe('postgres_password');
    expect(config.JWT_ACCESS_SECRET).toBe(validConfig.JWT_ACCESS_SECRET);
    expect(config.JWT_REFRESH_SECRET).toBe(validConfig.JWT_REFRESH_SECRET);
  });

  it('fails fast when DATABASE_PASSWORD is missing', () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as Record<string, unknown>).DATABASE_PASSWORD;

    expect(() => validate(invalidConfig)).toThrow(
      /Environment validation failed.*DATABASE_PASSWORD/s,
    );
  });

  it('sets default values for optional configurations', () => {
    const minimalConfig = {
      DATABASE_PASSWORD: 'some_password',
      JWT_ACCESS_SECRET: validConfig.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: validConfig.JWT_REFRESH_SECRET,
    };

    const config = validate(minimalConfig);
    expect(config.NODE_ENV).toBe(Environment.Development);
    expect(config.PORT).toBe(3000);
    expect(config.DATABASE_HOST).toBe('localhost');
    expect(config.DATABASE_PORT).toBe(5432);
    expect(config.DATABASE_NAME).toBe('fixhome');
    expect(config.DATABASE_USER).toBe('postgres');
    expect(config.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    expect(config.JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  it.each(['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'])(
    'requires %s without a fallback',
    (key) => {
      const config = {
        ...validConfig,
        [key]: undefined,
        JWT_SECRET: 'legacy-secret-must-not-enable-access',
      };
      expect(() => validate(config)).toThrow(/Environment validation failed/);
    },
  );

  it.each([
    { PORT: 1.5 },
    { DATABASE_PORT: 70000 },
    { JWT_ACCESS_EXPIRES_IN: '0s' },
    { JWT_REFRESH_EXPIRES_IN: '7' },
    { DATABASE_SSL: 'yes' },
    { CORS_ORIGIN: '*' },
    { JWT_REFRESH_SECRET: validConfig.JWT_ACCESS_SECRET },
  ])('rejects invalid config %j', (invalid) => {
    expect(() => validate({ ...validConfig, ...invalid })).toThrow();
  });
});
