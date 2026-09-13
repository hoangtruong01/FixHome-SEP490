// src/database/migrations/1725891000000-Phase0Bootstrap.ts
// Phase 0: Bootstrap migration — system_config, RBAC tables, audit_logs, user_scopes
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase0Bootstrap1725891000000 implements MigrationInterface {
  name = 'Phase0Bootstrap1725891000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ---- system_configs (P2.3) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_configs" (
        "key" varchar(128) PRIMARY KEY,
        "value" text NOT NULL,
        "value_type" varchar(16) NOT NULL,
        "description" text,
        "updated_by_user_id" uuid,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    // ---- roles (D-18) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(64) NOT NULL,
        "name" varchar(128) NOT NULL,
        "description" text,
        "is_system" boolean NOT NULL DEFAULT true,
        CONSTRAINT "uq_role_code" UNIQUE ("code")
      )
    `);

    // ---- permissions (D-17, D-18) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(128) NOT NULL,
        "resource" varchar(64) NOT NULL,
        "action" varchar(64) NOT NULL,
        "description" text,
        CONSTRAINT "uq_permission_code" UNIQUE ("code")
      )
    `);

    // ---- role_permissions (D-18) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "fk_rp_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_rp_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // ---- user_scopes (OPEN-SM-01) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_scopes" (
        "user_id" uuid PRIMARY KEY,
        "scope_type" varchar(32) NOT NULL DEFAULT 'GLOBAL',
        "scope_province_codes" text[],
        CONSTRAINT "fk_us_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ---- audit_logs ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "actor_user_id" uuid,
        "actor_role" varchar(32),
        "action" varchar(128) NOT NULL,
        "resource_type" varchar(64) NOT NULL,
        "resource_id" varchar(128),
        "before" jsonb,
        "after" jsonb,
        "ip" varchar(45),
        "user_agent" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "ix_audit_actor" ON "audit_logs" ("actor_user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "ix_audit_resource" ON "audit_logs" ("resource_type", "resource_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "ix_audit_created" ON "audit_logs" ("created_at")`);

    // ---- Add missing columns to users (P3.2) ----
    // avatarUrl
    const hasAvatar = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url'`
    );
    if (hasAvatar.length === 0) {
      await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "avatar_url" text`);
    }

    // bookingSuspendedUntil
    const hasBSU = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'booking_suspended_until'`
    );
    if (hasBSU.length === 0) {
      await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "booking_suspended_until" timestamptz`);
    }

    // Update account_status enum to include pending_verification if not already
    // PostgreSQL enums need ALTER TYPE ... ADD VALUE
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_verification' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'users_status_enum')) THEN
          ALTER TYPE "users_status_enum" ADD VALUE IF NOT EXISTS 'pending_verification';
        END IF;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_scopes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "system_configs" CASCADE`);
    // User columns and enum values are intentionally kept on revert
  }
}
