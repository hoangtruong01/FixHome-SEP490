// src/database/migrations/1725892000000-Phase1AuthUsers.ts
// Phase 1: Addresses and Technician profile & related tables
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase1AuthUsers1725892000000 implements MigrationInterface {
  name = 'Phase1AuthUsers1725892000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ---- addresses (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "label" varchar(100),
        "line1" varchar(255) NOT NULL,
        "ward" varchar(100),
        "district" varchar(100) NOT NULL,
        "province" varchar(100) NOT NULL,
        "lat" numeric(10, 7),
        "lng" numeric(10, 7),
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_addresses_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_addresses_user_id" ON "addresses" ("user_id")
    `);

    // ---- technician_profiles (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE,
        "verification_status" varchar(32) NOT NULL DEFAULT 'pending',
        "years_experience" int NOT NULL DEFAULT 0,
        "bio" text,
        "average_rating" numeric(3, 2) NOT NULL DEFAULT 5.00,
        "rating_count" int NOT NULL DEFAULT 0,
        "reliability_score" int NOT NULL DEFAULT 100,
        "work_suspended_until" timestamptz,
        "is_available" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tech_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_technician_profiles_user_id" ON "technician_profiles" ("user_id")
    `);

    // ---- technician_skills (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_skills" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "technician_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "level" varchar(50) NOT NULL DEFAULT 'INTERMEDIATE',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tech_skills_profile" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_tech_skills_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_tech_skill_unique" UNIQUE ("technician_id", "service_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_skills_tech" ON "technician_skills" ("technician_id")
    `);

    // ---- technician_service_areas (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_service_areas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "technician_id" uuid NOT NULL,
        "province_code" varchar(50) NOT NULL,
        "district_code" varchar(50) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tech_areas_profile" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_tech_area_unique" UNIQUE ("technician_id", "province_code", "district_code")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_areas_tech" ON "technician_service_areas" ("technician_id")
    `);

    // ---- technician_schedules (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_schedules" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "technician_id" uuid NOT NULL,
        "day_of_week" smallint NOT NULL,
        "start_time" varchar(5) NOT NULL,
        "end_time" varchar(5) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tech_schedules_profile" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_schedules_tech_day" ON "technician_schedules" ("technician_id", "day_of_week")
    `);

    // ---- technician_time_off (P3.2) ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_time_off" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "technician_id" uuid NOT NULL,
        "start_at" timestamptz NOT NULL,
        "end_at" timestamptz NOT NULL,
        "reason" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_tech_time_off_profile" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_time_off_range" ON "technician_time_off" ("technician_id", "start_at", "end_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_time_off" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_schedules" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_service_areas" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_skills" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_profiles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses" CASCADE`);
  }
}
