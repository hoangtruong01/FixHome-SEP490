import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoreIntegrity1725890000000 implements MigrationInterface {
  name = 'CoreIntegrity1725890000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Old synchronized development tables used timestamp without time zone.
    // Interpret those historical values as UTC; never drop timestamp data.
    for (const table of [
      'users',
      'refresh_tokens',
      'service_categories',
      'services',
      'technician_verifications',
      'verification_documents',
    ]) {
      for (const column of ['created_at', 'updated_at']) {
        const rows = await queryRunner.query(
          `SELECT data_type FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 AND column_name = $2`,
          [table, column],
        );
        if (rows[0]?.data_type === 'timestamp without time zone')
          await queryRunner.query(
            `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE timestamptz USING "${column}" AT TIME ZONE 'UTC'`,
          );
      }
    }
    await queryRunner.query(
      `UPDATE users SET status = 'locked' WHERE is_active = false AND status = 'active'`,
    );
    await queryRunner.query(
      `UPDATE users SET is_active = false WHERE status <> 'active'`,
    );
    // Normalize identifiers; uniqueness collisions abort the migration for explicit resolution.
    await queryRunner.query(
      `UPDATE users SET email = lower(trim(email)), phone_number = regexp_replace(trim(phone_number), '^\\+84', '0')`,
    );
    // Legacy same-second JWTs could share a hash: revoke every affected session, preserving history.
    await queryRunner.query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE token_hash IN (SELECT token_hash FROM refresh_tokens GROUP BY token_hash HAVING count(*) > 1)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_one_open_verification" ON technician_verifications (technician_id) WHERE status IN ('pending', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE services ADD CONSTRAINT "chk_services_prices" CHECK (base_price >= 0 AND min_price >= 0 AND max_price >= 0 AND min_price <= max_price)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE services DROP CONSTRAINT "chk_services_prices"`,
    );
    await queryRunner.query(`DROP INDEX "idx_one_open_verification"`);
    // Normalized identifiers, UTC timestamps and revoked insecure sessions intentionally remain.
  }
}
