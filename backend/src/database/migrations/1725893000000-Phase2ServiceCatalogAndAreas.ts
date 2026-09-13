// src/database/migrations/1725893000000-Phase2ServiceCatalogAndAreas.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2ServiceCatalogAndAreas1725893000000 implements MigrationInterface {
  name = 'Phase2ServiceCatalogAndAreas1725893000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. service_categories: add slug, icon_key, sort_order
    await queryRunner.query(`
      ALTER TABLE "service_categories"
      ADD COLUMN IF NOT EXISTS "slug" VARCHAR,
      ADD COLUMN IF NOT EXISTS "icon_key" VARCHAR,
      ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_service_categories_slug"
      ON "service_categories" ("slug")
      WHERE "slug" IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_service_categories_sort_order"
      ON "service_categories" ("sort_order");
    `);

    // 2. services: add slug, estimated_minutes
    await queryRunner.query(`
      ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "slug" VARCHAR,
      ADD COLUMN IF NOT EXISTS "estimated_minutes" INTEGER NOT NULL DEFAULT 60;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_services_slug"
      ON "services" ("slug")
      WHERE "slug" IS NOT NULL;
    `);

    // 3. service_areas: operational zones by province & district
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_areas" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "province_code" VARCHAR NOT NULL,
        "province_name" VARCHAR NOT NULL,
        "district_code" VARCHAR NOT NULL,
        "district_name" VARCHAR NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_service_areas_province_district"
      ON "service_areas" ("province_code", "district_code");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_service_areas_province_code"
      ON "service_areas" ("province_code");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_service_areas_is_active"
      ON "service_areas" ("is_active");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "service_areas" CASCADE;`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_services_slug";`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN IF EXISTS "estimated_minutes", DROP COLUMN IF EXISTS "slug";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_service_categories_sort_order";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_service_categories_slug";`);
    await queryRunner.query(`ALTER TABLE "service_categories" DROP COLUMN IF EXISTS "sort_order", DROP COLUMN IF EXISTS "icon_key", DROP COLUMN IF EXISTS "slug";`);
  }
}
