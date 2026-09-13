// src/database/data-source.ts
// Standalone DataSource for TypeORM CLI migration commands.
// This file is NOT used by NestJS at runtime (NestJS uses DatabaseModule).
// It is referenced by package.json scripts: migration:run, migration:revert, migration:generate.

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env for CLI usage

if (!process.env.DATABASE_PASSWORD?.trim())
  throw new Error('DATABASE_PASSWORD is required for migrations');
const databasePort = Number(process.env.DATABASE_PORT || 5432);
if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535)
  throw new Error('Invalid DATABASE_PORT');
if (
  process.env.DATABASE_SSL &&
  !['true', 'false'].includes(process.env.DATABASE_SSL)
)
  throw new Error('Invalid DATABASE_SSL');

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: databasePort,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'fixhome',
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});
