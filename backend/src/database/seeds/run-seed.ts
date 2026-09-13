// src/database/seeds/run-seed.ts
// Seed runner — P12.3: `npm run seed:demo`
// Runs migrations first, then seeds config and RBAC data.

import 'reflect-metadata';
import dataSource from '../data-source';
import { seedConfig } from './seed-config';
import { seedRbac } from './seed-rbac';
import { seedUsers } from './seed-users';
import { seedCatalog } from './seed-catalog';

async function runSeed(): Promise<void> {
  console.log('🌱 Starting FixHome seed...\n');

  try {
    await dataSource.initialize();
    console.log('📦 Database connected\n');

    // Run pending migrations
    const pendingMigrations = await dataSource.runMigrations();
    if (pendingMigrations.length > 0) {
      console.log(`📋 Ran ${pendingMigrations.length} migration(s):`);
      for (const m of pendingMigrations) {
        console.log(`   - ${m.name}`);
      }
      console.log();
    } else {
      console.log('📋 No pending migrations\n');
    }

    // Seed system_config (P2.3)
    await seedConfig(dataSource);
    console.log();

    // Seed RBAC (D-18, P5.2)
    await seedRbac(dataSource);
    console.log();

    // Seed Demo Users (P12.3)
    await seedUsers(dataSource);
    console.log();

    // Seed Service Catalog & Areas (Phase 2)
    await seedCatalog(dataSource);
    console.log();

    console.log('🎉 Seed complete!\n');

    // Print demo credentials
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  Demo Accounts (P12.3) — All passwords: Password123!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  👑 ADMIN:');
    console.log('     admin@fixhome.vn');
    console.log('  👔 SERVICE MANAGERS:');
    console.log('     sm.hcm@fixhome.vn (Global Scope)');
    console.log('     sm.hn@fixhome.vn  (Hanoi Scope)');
    console.log('  🔧 TECHNICIANS (12 accounts):');
    console.log('     tech1@fixhome.vn ... tech12@fixhome.vn');
    console.log('  👤 CUSTOMERS (8 accounts):');
    console.log('     customer1@fixhome.vn ... customer7@fixhome.vn (Active)');
    console.log('     customer.suspended@fixhome.vn (Suspended for demo)');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void runSeed();
