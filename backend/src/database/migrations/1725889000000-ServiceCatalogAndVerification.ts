// src/database/migrations/1725889000000-ServiceCatalogAndVerification.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceCatalogAndVerification1725889000000 implements MigrationInterface {
  name = 'ServiceCatalogAndVerification1725889000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['service_categories', 'services', 'technician_verifications', 'verification_documents'];
    const createdTables: string[] = [];
    for (const table of tables) if (!await queryRunner.hasTable(table)) createdTables.push(table);
    // 1. Enums for Technician Verification
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "technician_verifications_status_enum" AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "verification_documents_document_type_enum" AS ENUM ('citizen_id_front', 'citizen_id_back', 'certificate', 'portfolio', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. service_categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL,
        "code" VARCHAR NOT NULL,
        "description" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_service_categories_code" ON "service_categories" ("code");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_service_categories_is_active" ON "service_categories" ("is_active");
    `);

    // 3. services table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "category_id" UUID NOT NULL,
        "name" VARCHAR NOT NULL,
        "code" VARCHAR NOT NULL,
        "description" TEXT,
        "base_price" NUMERIC(12, 2),
        "min_price" NUMERIC(12, 2),
        "max_price" NUMERIC(12, 2),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "fk_services_category" FOREIGN KEY ("category_id") REFERENCES "service_categories" ("id") ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_services_code" ON "services" ("code");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_services_category_id" ON "services" ("category_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_services_is_active" ON "services" ("is_active");
    `);

    // 4. technician_verifications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_verifications" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "technician_id" UUID NOT NULL,
        "status" "technician_verifications_status_enum" NOT NULL DEFAULT 'pending',
        "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "reviewed_at" TIMESTAMP WITH TIME ZONE,
        "reviewed_by" UUID,
        "rejection_reason" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "fk_technician_verifications_technician" FOREIGN KEY ("technician_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_technician_verifications_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_verifications_technician_id" ON "technician_verifications" ("technician_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technician_verifications_status" ON "technician_verifications" ("status");
    `);

    // 5. verification_documents table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "verification_documents" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "verification_id" UUID NOT NULL,
        "document_type" "verification_documents_document_type_enum" NOT NULL DEFAULT 'other',
        "file_url" VARCHAR NOT NULL,
        "file_name" VARCHAR NOT NULL,
        "file_size" INTEGER NOT NULL,
        "mime_type" VARCHAR NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "fk_verification_documents_verification" FOREIGN KEY ("verification_id") REFERENCES "technician_verifications" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_verification_documents_verification_id" ON "verification_documents" ("verification_id");
    `);
    for (const table of createdTables) await queryRunner.query(`COMMENT ON TABLE "${table}" IS 'fixhome:ServiceCatalogAndVerification1725889000000:created'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['verification_documents', 'technician_verifications', 'services', 'service_categories']) {
      const [ownership] = await queryRunner.query(`SELECT obj_description($1::regclass) AS marker`, [table]);
      if (ownership.marker !== 'fixhome:ServiceCatalogAndVerification1725889000000:created') throw new Error('Refusing to drop adopted catalog/verification tables; use a reviewed forward migration');
    }
    await queryRunner.query(`DROP TABLE IF EXISTS "verification_documents";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_verifications";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_categories";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "verification_documents_document_type_enum";`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "technician_verifications_status_enum";`,
    );
  }
}
