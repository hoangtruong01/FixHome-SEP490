// src/database/data-source.ts
// Standalone DataSource for TypeORM CLI migration commands.
// This file is NOT used by NestJS at runtime (NestJS uses DatabaseModule).
// It is referenced by package.json scripts: migration:run, migration:revert, migration:generate.

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env for CLI usage

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'fixhome',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});
