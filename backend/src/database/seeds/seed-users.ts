// src/database/seeds/seed-users.ts
// Seeds demo accounts per P12.3:
// 1 Admin, 2 SM, 12 Technicians (with profiles, areas, schedules), 8 Customers (1 suspended)
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, AccountStatus, VerificationStatus } from '../../shared/enums';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  console.log('👤 Seeding demo user accounts per P12.3...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Admin
  await queryRunner.query(
    `INSERT INTO "users" ("id", "email", "password_hash", "full_name", "phone_number", "role", "status", "is_active")
     VALUES ('a0000000-0000-0000-0000-000000000001', 'admin@fixhome.vn', $1, 'Admin FixHome', '0901000001', $2, $3, true)
     ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"`,
    [passwordHash, Role.ADMIN, AccountStatus.ACTIVE],
  );

  // 2. Service Managers
  const smAccounts = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      email: 'sm.hcm@fixhome.vn',
      fullName: 'Quan Ly HCM',
      phone: '0902000001',
      scopeType: 'GLOBAL',
      provinceCodes: null,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      email: 'sm.hn@fixhome.vn',
      fullName: 'Quan Ly Ha Noi',
      phone: '0902000002',
      scopeType: 'REGIONAL',
      provinceCodes: ['01'], // Hanoi code
    },
  ];

  for (const sm of smAccounts) {
    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "password_hash", "full_name", "phone_number", "role", "status", "is_active")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"`,
      [sm.id, sm.email, passwordHash, sm.fullName, sm.phone, Role.SERVICE_MANAGER, AccountStatus.ACTIVE],
    );

    await queryRunner.query(
      `INSERT INTO "user_scopes" ("user_id", "scope_type", "scope_province_codes")
       VALUES ($1, $2, $3)
       ON CONFLICT ("user_id") DO UPDATE SET "scope_type" = EXCLUDED."scope_type"`,
      [sm.id, sm.scopeType, sm.provinceCodes],
    );
  }

  // 3. Technicians (12 accounts)
  for (let i = 1; i <= 12; i++) {
    const techId = `c0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`;
    const profileId = `c1000000-0000-0000-0000-${i.toString().padStart(12, '0')}`;
    const email = `tech${i}@fixhome.vn`;
    const phone = `0903${i.toString().padStart(6, '0')}`;
    const name = `Tho Dien Lanh ${i}`;
    const rating = (4.5 + (i % 6) * 0.1).toFixed(2);

    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "password_hash", "full_name", "phone_number", "role", "status", "is_active")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"`,
      [techId, email, passwordHash, name, phone, Role.TECHNICIAN, AccountStatus.ACTIVE],
    );

    await queryRunner.query(
      `INSERT INTO "technician_profiles" ("id", "user_id", "verification_status", "years_experience", "bio", "average_rating", "rating_count", "reliability_score", "is_available")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 100, true)
       ON CONFLICT ("user_id") DO UPDATE SET "average_rating" = EXCLUDED."average_rating"`,
      [
        profileId,
        techId,
        VerificationStatus.APPROVED,
        3 + (i % 10),
        `Kỹ thuật viên chuyên nghiệp với hơn ${3 + (i % 10)} năm kinh nghiệm sửa chữa điện lạnh, điện nước gia đình.`,
        rating,
        15 + i * 4,
      ],
    );

    // Schedule: Mon to Sat (1..6), 08:00 - 18:00
    for (let day = 1; day <= 6; day++) {
      await queryRunner.query(
        `INSERT INTO "technician_schedules" ("technician_id", "day_of_week", "start_time", "end_time")
         VALUES ($1, $2, '08:00', '18:00')
         ON CONFLICT DO NOTHING`,
        [profileId, day],
      );
    }

    // Service Areas (HCM districts)
    await queryRunner.query(
      `INSERT INTO "technician_service_areas" ("technician_id", "province_code", "district_code")
       VALUES ($1, '79', $2)
       ON CONFLICT DO NOTHING`,
      [profileId, `79${(i % 10 + 1).toString().padStart(2, '0')}`],
    );
  }

  // 4. Customers (8 accounts, 1 suspended)
  const suspendUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  for (let i = 1; i <= 8; i++) {
    const custId = `d0000000-0000-0000-0000-${i.toString().padStart(12, '0')}`;
    const email = i === 8 ? 'customer.suspended@fixhome.vn' : `customer${i}@fixhome.vn`;
    const phone = `0904${i.toString().padStart(6, '0')}`;
    const name = i === 8 ? 'Khach Hang Bi Khoa' : `Khach Hang ${i}`;
    const status = i === 8 ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;
    const suspendedUntil = i === 8 ? suspendUntil : null;

    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "password_hash", "full_name", "phone_number", "role", "status", "is_active", "booking_suspended_until")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
       ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"`,
      [custId, email, passwordHash, name, phone, Role.CUSTOMER, status, suspendedUntil],
    );

    // Default address for each customer
    await queryRunner.query(
      `INSERT INTO "addresses" ("user_id", "label", "line1", "ward", "district", "province", "lat", "lng", "is_default")
       VALUES ($1, 'Nhà riêng', $2, 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', 10.7769, 106.7009, true)
       ON CONFLICT DO NOTHING`,
      [custId, `${100 + i} Lê Thánh Tôn`],
    );
  }

  await queryRunner.release();
  console.log('✅ Seeded: 1 Admin, 2 SMs, 12 Technicians (with profiles & schedules), 8 Customers (1 suspended)');
}
