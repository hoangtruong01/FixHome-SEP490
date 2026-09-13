// src/database/migrations/1725888000000-InitialBaseline.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialBaseline1725888000000 implements MigrationInterface {
  name = 'InitialBaseline1725888000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adoptingUsers = await queryRunner.hasTable('users');
    // 1. Ensure uuid-ossp extension exists
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;`,
    );

    // 2. Create Enums if they do not exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM ('customer', 'technician', 'service_manager', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_status_enum" AS ENUM ('active', 'locked', 'suspended');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR NOT NULL,
        "password_hash" VARCHAR NOT NULL,
        "full_name" VARCHAR NOT NULL,
        "phone_number" VARCHAR,
        "role" "users_role_enum" NOT NULL DEFAULT 'customer',
        "status" "users_status_enum" NOT NULL DEFAULT 'active',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    // Adopt a legacy development users table without losing locked accounts or data.
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "users_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "status" = 'locked' WHERE "is_active" = false AND "status" = 'active'`,
    );

    // 4. Create indexes on users
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_phone_number" ON "users" ("phone_number") WHERE "phone_number" IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status");
    `);

    // 5. Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "token_hash" VARCHAR NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "is_revoked" BOOLEAN NOT NULL DEFAULT false,
        "device_info" VARCHAR,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      );
    `);

    // 6. Create indexes on refresh_tokens
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash");
    `);
    if (!adoptingUsers) await queryRunner.query(`COMMENT ON TABLE users IS 'fixhome:InitialBaseline1725888000000:created'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [ownership] = await queryRunner.query(`SELECT obj_description('users'::regclass) AS marker`);
    if (ownership.marker !== 'fixhome:InitialBaseline1725888000000:created') throw new Error('Refusing to drop an adopted users table; use a reviewed forward migration');
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum";`);
  }
}
