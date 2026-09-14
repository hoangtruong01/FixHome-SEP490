// src/database/migrations/1725895000000-SpecV12PricingAndSettlement.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SpecV12PricingAndSettlement1725895000000
  implements MigrationInterface
{
  name = 'SpecV12PricingAndSettlement1725895000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Service Pricing Mode enum & columns on services
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_pricing_mode_enum') THEN
          CREATE TYPE service_pricing_mode_enum AS ENUM ('fixed_price', 'inspection_required');
        END IF;
      END $$;
      ALTER TYPE invitation_status_enum ADD VALUE IF NOT EXISTS 'standby';
    `);

    await queryRunner.query(`
      ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "pricing_mode" service_pricing_mode_enum NOT NULL DEFAULT 'inspection_required',
      ADD COLUMN IF NOT EXISTS "unit" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "fixed_price" NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS "scope_description" TEXT;
    `);

    // 2. Listed Labor Price on technician_skills & Priority Boost on technician_profiles
    await queryRunner.query(`
      ALTER TABLE "technician_skills"
      ADD COLUMN IF NOT EXISTS "listed_labor_price" NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS "typical_warranty_days" INT DEFAULT 30,
      ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

      ALTER TABLE "technician_profiles"
      ADD COLUMN IF NOT EXISTS "priority_boost_until" TIMESTAMPTZ;
    `);

    // 3. Booking snapshot & scheduling fields
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "preferred_time_window" VARCHAR(100),
      ADD COLUMN IF NOT EXISTS "pricing_mode_snapshot" service_pricing_mode_enum,
      ADD COLUMN IF NOT EXISTS "fixed_unit_price_snapshot" NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS "quantity" INT NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "scope_snapshot" TEXT;

      ALTER TABLE "booking_invitations" ALTER COLUMN "expires_at" DROP NOT NULL;
    `);

    // 4. Update default on service_orders status to accepted
    await queryRunner.query(`
      ALTER TABLE "service_orders" ALTER COLUMN "status" SET DEFAULT 'accepted';
    `);

    // 5. Cash settlement status enum & table
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cash_settlement_status_enum') THEN
          CREATE TYPE cash_settlement_status_enum AS ENUM ('pending_confirmation', 'confirmed', 'disputed');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cash_settlements" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "service_order_id" UUID NOT NULL REFERENCES "service_orders"("id") ON DELETE RESTRICT,
        "declared_by_technician_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "declared_amount" NUMERIC(12, 2) NOT NULL,
        "declared_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "technician_notes" TEXT,
        "receipt_evidence_url" TEXT,
        "confirmed_by_customer_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "confirmed_amount" NUMERIC(12, 2),
        "confirmed_at" TIMESTAMPTZ,
        "status" cash_settlement_status_enum NOT NULL DEFAULT 'pending_confirmation',
        "manager_resolution_reason" TEXT,
        "resolved_by_manager_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
        "resolved_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_cash_settlement_order" UNIQUE ("service_order_id")
      );
    `);

    // 6. Commission due status enum & table
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_due_status_enum') THEN
          CREATE TYPE commission_due_status_enum AS ENUM ('pending', 'paid', 'cancelled');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "commission_dues" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "technician_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "service_order_id" UUID NOT NULL REFERENCES "service_orders"("id") ON DELETE RESTRICT,
        "cash_settlement_id" UUID REFERENCES "cash_settlements"("id") ON DELETE SET NULL,
        "labor_total_snapshot" NUMERIC(12, 2) NOT NULL,
        "commission_rate_snapshot" NUMERIC(5, 4) NOT NULL DEFAULT 0.1000,
        "due_amount" NUMERIC(12, 2) NOT NULL,
        "status" commission_due_status_enum NOT NULL DEFAULT 'pending',
        "paid_at" TIMESTAMPTZ,
        "payment_reference" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_commission_due_order" UNIQUE ("service_order_id")
      );
    `);

    // 7. Warranty claim status enum & table
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warranty_claim_status_enum') THEN
          CREATE TYPE warranty_claim_status_enum AS ENUM ('open', 'reviewing', 'rework', 'resolved', 'rejected');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "warranty_claims" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "warranty_coverage_id" UUID NOT NULL REFERENCES "warranty_coverages"("id") ON DELETE RESTRICT,
        "service_order_id" UUID NOT NULL REFERENCES "service_orders"("id") ON DELETE RESTRICT,
        "customer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "claim_reason" TEXT NOT NULL,
        "issue_description" TEXT NOT NULL,
        "status" warranty_claim_status_enum NOT NULL DEFAULT 'open',
        "is_covered" BOOLEAN,
        "technician_response" TEXT,
        "manager_notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_commission_dues_tech_status" ON "commission_dues" ("technician_id", "status");
      CREATE INDEX IF NOT EXISTS "idx_cash_settlements_status" ON "cash_settlements" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "warranty_claims";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "commission_dues";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cash_settlements";`);
    await queryRunner.query(`
      ALTER TABLE "bookings"
      DROP COLUMN IF EXISTS "scope_snapshot",
      DROP COLUMN IF EXISTS "quantity",
      DROP COLUMN IF EXISTS "fixed_unit_price_snapshot",
      DROP COLUMN IF EXISTS "pricing_mode_snapshot",
      DROP COLUMN IF EXISTS "preferred_time_window";
    `);
    await queryRunner.query(`
      ALTER TABLE "technician_skills"
      DROP COLUMN IF EXISTS "is_active",
      DROP COLUMN IF EXISTS "typical_warranty_days",
      DROP COLUMN IF EXISTS "listed_labor_price";
    `);
    await queryRunner.query(`
      ALTER TABLE "services"
      DROP COLUMN IF EXISTS "scope_description",
      DROP COLUMN IF EXISTS "fixed_price",
      DROP COLUMN IF EXISTS "unit",
      DROP COLUMN IF EXISTS "pricing_mode";
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS warranty_claim_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS commission_due_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS cash_settlement_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS service_pricing_mode_enum;`);
  }
}
