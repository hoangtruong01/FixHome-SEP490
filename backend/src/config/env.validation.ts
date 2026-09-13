// src/config/env.validation.ts
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT: number = 3000;

  // Database (PostgreSQL)
  @IsString()
  @IsOptional()
  DATABASE_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsOptional()
  DATABASE_NAME: string = 'fixhome';

  @IsString()
  @IsOptional()
  DATABASE_USER: string = 'postgres';

  @IsString()
  @MinLength(1)
  DATABASE_PASSWORD: string;

  @IsOptional()
  DATABASE_SSL?: string | boolean;

  // JWT Authentication
  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION?: string = '1d';

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  // AI Service
  @IsString()
  @IsOptional()
  AI_SERVICE_URL: string = 'http://localhost:8000';

  // Cloudinary (Optional)
  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  // Google Maps (Optional)
  @IsString()
  @IsOptional()
  GOOGLE_MAPS_API_KEY?: string;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:5173,http://localhost:8081';
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `[ConfigModule] Environment validation failed:\n${formattedErrors}\n` +
        `Please verify your .env file matches .env.example.`,
    );
  }

  const fail = (field: string): never => {
    throw new Error(`[ConfigModule] Invalid ${field}; check .env.example`);
  };
  if (
    validatedConfig.JWT_ACCESS_SECRET === validatedConfig.JWT_REFRESH_SECRET
  ) {
    fail('JWT secrets: access and refresh secrets must differ');
  }
  for (const key of [
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
  ] as const) {
    if (!/^[1-9]\d*(s|m|h|d)$/.test(validatedConfig[key])) fail(key);
  }
  if (
    config.DATABASE_SSL !== undefined &&
    !['true', 'false', true, false].includes(
      config.DATABASE_SSL as string | boolean,
    )
  ) {
    fail('DATABASE_SSL');
  }
  validatedConfig.DATABASE_SSL =
    config.DATABASE_SSL === true || config.DATABASE_SSL === 'true';
  if (validatedConfig.NODE_ENV === Environment.Production) {
    for (const key of [
      'DATABASE_HOST',
      'DATABASE_USER',
      'DATABASE_NAME',
      'CORS_ORIGIN',
    ] as const) {
      if (typeof config[key] !== 'string' || !(config[key] as string).trim())
        fail(key);
    }
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (
        /default|change.?in.?production|replace|example/i.test(
          validatedConfig[key],
        )
      )
        fail(key);
    }
  }
  for (const origin of validatedConfig.CORS_ORIGIN.split(',')) {
    try {
      const url = new URL(origin.trim());
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.origin !== origin.trim()
      )
        fail('CORS_ORIGIN');
    } catch {
      fail('CORS_ORIGIN');
    }
  }
  return validatedConfig;
}
