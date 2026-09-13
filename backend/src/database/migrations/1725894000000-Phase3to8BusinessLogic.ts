// src/database/migrations/1725894000000-Phase3to8BusinessLogic.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 3–8: Creates all remaining business tables for the FixHome platform.
 * Tables: bookings, booking_media, ai_diagnoses, booking_invitations,
 * service_orders, technician_assignments, order_status_history,
 * quotations, quotation_items, additional_cost_requests, additional_cost_items,
 * repair_evidences, arrival_check_ins, cancellations, cancellation_strikes,
 * invoices, invoice_items, warranty_coverages, reviews
 */
export class Phase3to8BusinessLogic1725894000000
  implements MigrationInterface
{
  name = 'Phase3to8BusinessLogic1725894000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ──
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level_enum') THEN
          CREATE TYPE urgency_level_enum AS ENUM ('low','medium','high','critical');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
          CREATE TYPE booking_status_enum AS ENUM ('pending','matching','matched','cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status_enum') THEN
          CREATE TYPE invitation_status_enum AS ENUM ('pending','accepted','declined','expired','cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_order_status_enum') THEN
          CREATE TYPE service_order_status_enum AS ENUM ('pending_confirmation','accepted','en_route','under_repair','completed','cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'check_in_result_enum') THEN
          CREATE TYPE check_in_result_enum AS ENUM ('valid','out_of_geofence','low_accuracy','failed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidence_type_enum') THEN
          CREATE TYPE evidence_type_enum AS ENUM ('before','additional','after');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cost_item_type_enum') THEN
          CREATE TYPE cost_item_type_enum AS ENUM ('labor','parts_equipment');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quotation_status_enum') THEN
          CREATE TYPE quotation_status_enum AS ENUM ('draft','sent','approved','rejected','superseded');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'additional_cost_status_enum') THEN
          CREATE TYPE additional_cost_status_enum AS ENUM ('pending_approval','approved','rejected','expired','cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancel_actor_enum') THEN
          CREATE TYPE cancel_actor_enum AS ENUM ('customer','technician','service_manager','admin');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'strike_status_enum') THEN
          CREATE TYPE strike_status_enum AS ENUM ('active','waived','expired');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compensation_status_enum') THEN
          CREATE TYPE compensation_status_enum AS ENUM ('not_eligible','eligible','granted','rejected');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
          CREATE TYPE payment_status_enum AS ENUM ('unpaid','paid','refunded');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'warranty_status_enum') THEN
          CREATE TYPE warranty_status_enum AS ENUM ('pending','active','expired','voided');
        END IF;
      END $$;
    `);

    // ── bookings ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bookings" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "customer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "service_id" uuid NOT NULL REFERENCES "services"("id") ON DELETE RESTRICT,
        "address_id" uuid REFERENCES "addresses"("id") ON DELETE SET NULL,
        "description" text NOT NULL,
        "preferred_at" timestamptz,
        "urgency" urgency_level_enum NOT NULL DEFAULT 'medium',
        "status" booking_status_enum NOT NULL DEFAULT 'pending',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "ix_bookings_customer" ON "bookings" ("customer_id", "created_at" DESC);
      CREATE INDEX IF NOT EXISTS "ix_bookings_status" ON "bookings" ("status");
    `);

    // ── booking_media ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_media" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
        "url" varchar NOT NULL,
        "mime_type" varchar NOT NULL DEFAULT 'image/jpeg',
        "size_bytes" int,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "ix_booking_media_booking" ON "booking_media" ("booking_id");
    `);

    // ── ai_diagnoses ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_diagnoses" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
        "provider" varchar NOT NULL DEFAULT 'stub',
        "model" varchar,
        "request_hash" varchar,
        "possible_issues" jsonb,
        "possible_causes" jsonb,
        "urgency" varchar,
        "price_range_min" bigint DEFAULT 0,
        "price_range_max" bigint DEFAULT 0,
        "suggested_service_id" uuid REFERENCES "services"("id") ON DELETE SET NULL,
        "confidence" decimal(5,2) DEFAULT 0,
        "latency_ms" int DEFAULT 0,
        "raw_response" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "ix_ai_diagnoses_booking" ON "ai_diagnoses" ("booking_id");
    `);

    // ── booking_invitations ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_invitations" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "priority_order" int NOT NULL DEFAULT 0,
        "status" invitation_status_enum NOT NULL DEFAULT 'pending',
        "invited_at" timestamptz NOT NULL DEFAULT now(),
        "responded_at" timestamptz,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "uq_invitation" ON "booking_invitations" ("booking_id", "technician_id");
      CREATE INDEX "ix_invitation_tech_status" ON "booking_invitations" ("technician_id", "status");
    `);

    // ── service_orders ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "service_orders" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE RESTRICT,
        "code" varchar NOT NULL,
        "status" service_order_status_enum NOT NULL DEFAULT 'pending_confirmation',
        "scheduled_at" timestamptz,
        "started_at" timestamptz,
        "completed_at" timestamptz,
        "cancelled_at" timestamptz,
        "labor_total" bigint NOT NULL DEFAULT 0,
        "parts_total" bigint NOT NULL DEFAULT 0,
        "grand_total" bigint NOT NULL DEFAULT 0,
        "payment_status" payment_status_enum NOT NULL DEFAULT 'unpaid',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "uq_order_booking" ON "service_orders" ("booking_id");
      CREATE INDEX "ix_order_status_created" ON "service_orders" ("status", "created_at" DESC);
    `);

    // ── technician_assignments ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technician_assignments" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "assigned_at" timestamptz NOT NULL DEFAULT now(),
        "is_active" boolean NOT NULL DEFAULT true,
        "unassigned_at" timestamptz,
        "unassign_reason" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "uq_active_assignment" ON "technician_assignments" ("service_order_id") WHERE "is_active" = true;
    `);

    // ── order_status_history (D-22) ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_status_history" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "from_status" varchar,
        "to_status" varchar NOT NULL,
        "actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "actor_role" varchar,
        "reason" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "ix_status_history_order" ON "order_status_history" ("service_order_id", "created_at");
    `);

    // ── arrival_check_ins ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "arrival_check_ins" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "lat" decimal(10,7) NOT NULL,
        "lng" decimal(10,7) NOT NULL,
        "accuracy_meters" decimal(8,2) NOT NULL,
        "distance_meters" decimal(10,2),
        "result" check_in_result_enum NOT NULL,
        "checked_in_at" timestamptz NOT NULL DEFAULT now(),
        "device_info" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── repair_evidences ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "repair_evidences" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "uploader_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" evidence_type_enum NOT NULL,
        "media_url" varchar NOT NULL,
        "note" text,
        "captured_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "ix_evidence_order_type" ON "repair_evidences" ("service_order_id", "type");
    `);

    // ── quotations ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotations" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" quotation_status_enum NOT NULL DEFAULT 'draft',
        "labor_total" bigint NOT NULL DEFAULT 0,
        "parts_total" bigint NOT NULL DEFAULT 0,
        "note" text,
        "sent_at" timestamptz,
        "decided_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── quotation_items ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotation_items" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "quotation_id" uuid NOT NULL REFERENCES "quotations"("id") ON DELETE CASCADE,
        "type" cost_item_type_enum NOT NULL,
        "description" varchar NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "unit_price" bigint NOT NULL DEFAULT 0,
        "line_total" bigint NOT NULL DEFAULT 0,
        "warranty_days_snapshot" int DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── additional_cost_requests ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "additional_cost_requests" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" additional_cost_status_enum NOT NULL DEFAULT 'pending_approval',
        "reason" text NOT NULL,
        "total_labor_delta" bigint NOT NULL DEFAULT 0,
        "total_parts_delta" bigint NOT NULL DEFAULT 0,
        "decided_at" timestamptz,
        "decided_by_customer_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "expires_at" timestamptz NOT NULL,
        "supersedes_id" uuid REFERENCES "additional_cost_requests"("id") ON DELETE SET NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── additional_cost_items ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "additional_cost_items" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "request_id" uuid NOT NULL REFERENCES "additional_cost_requests"("id") ON DELETE CASCADE,
        "type" cost_item_type_enum NOT NULL,
        "description" varchar NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "unit_price" bigint NOT NULL DEFAULT 0,
        "line_total" bigint NOT NULL DEFAULT 0,
        "warranty_days" int DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── cancellations ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cancellations" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "actor" cancel_actor_enum NOT NULL,
        "actor_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "reason" text NOT NULL,
        "state_at_cancel" varchar NOT NULL,
        "strike_applied" boolean NOT NULL DEFAULT false,
        "compensation_status" compensation_status_enum NOT NULL DEFAULT 'not_eligible',
        "reviewed_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── cancellation_strikes ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cancellation_strikes" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "cancellation_id" uuid NOT NULL REFERENCES "cancellations"("id") ON DELETE CASCADE,
        "role" varchar NOT NULL,
        "status" strike_status_enum NOT NULL DEFAULT 'active',
        "expires_at" timestamptz NOT NULL,
        "waived_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "waive_reason" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "ix_strike_user_status" ON "cancellation_strikes" ("user_id", "status");
    `);

    // ── invoices ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "labor_total" bigint NOT NULL DEFAULT 0,
        "parts_total" bigint NOT NULL DEFAULT 0,
        "grand_total" bigint NOT NULL DEFAULT 0,
        "commission_base" varchar NOT NULL DEFAULT 'LABOR',
        "commission_amount" bigint NOT NULL DEFAULT 0,
        "payment_status" payment_status_enum NOT NULL DEFAULT 'unpaid',
        "issued_at" timestamptz NOT NULL DEFAULT now(),
        "paid_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── invoice_items ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_items" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
        "source_type" varchar NOT NULL DEFAULT 'QUOTATION',
        "source_item_id" uuid,
        "type" cost_item_type_enum NOT NULL,
        "description" varchar NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "unit_price" bigint NOT NULL DEFAULT 0,
        "line_total" bigint NOT NULL DEFAULT 0,
        "warranty_days_snapshot" int DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── warranty_coverages ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "warranty_coverages" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "invoice_item_id" uuid REFERENCES "invoice_items"("id") ON DELETE SET NULL,
        "warranty_days_snapshot" int NOT NULL DEFAULT 0,
        "note" text,
        "starts_at" timestamptz NOT NULL DEFAULT now(),
        "expires_at" timestamptz NOT NULL,
        "status" warranty_status_enum NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // ── reviews ──
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "service_order_id" uuid NOT NULL REFERENCES "service_orders"("id") ON DELETE CASCADE,
        "customer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "technician_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "rating" int NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
        "comment" text,
        "is_moderated" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "uq_review_order" ON "reviews" ("service_order_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "warranty_coverages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cancellation_strikes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cancellations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "additional_cost_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "additional_cost_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotation_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "repair_evidences" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "arrival_check_ins" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_status_history" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technician_assignments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_invitations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_diagnoses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_media" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings" CASCADE`);
  }
}
