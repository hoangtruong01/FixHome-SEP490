// src/database/seeds/seed-config.ts
// P2.3: Seed 24 system_config keys with defaults.
// Run via: npx ts-node src/database/seeds/seed-config.ts
// Also called by seed:demo script.

import { DataSource } from 'typeorm';

export interface ConfigSeedItem {
  key: string;
  value: string;
  valueType: 'int' | 'bigint' | 'string' | 'enum' | 'boolean';
  description: string;
}

/**
 * All 24 config keys from P2.3 of BUILD-BRIEF v2.0.
 * None of these values should be hard-coded anywhere in the application.
 */
export const CONFIG_SEED: ConfigSeedItem[] = [
  { key: 'matching.max_shortlist', value: '5', valueType: 'int', description: 'Maximum number of technicians in shortlist' },
  { key: 'matching.mode', value: 'SIMULTANEOUS', valueType: 'enum', description: 'Matching mode: SIMULTANEOUS or SEQUENTIAL' },
  { key: 'matching.invitation_ttl_minutes', value: '30', valueType: 'int', description: 'Invitation expiration in minutes' },
  { key: 'geofence.radius_meters', value: '300', valueType: 'int', description: 'Geofence radius for arrival check-in' },
  { key: 'geofence.min_gps_accuracy_meters', value: '100', valueType: 'int', description: 'Minimum GPS accuracy for valid check-in' },
  { key: 'evidence.before.min_count', value: '1', valueType: 'int', description: 'Minimum BEFORE evidence photos required' },
  { key: 'evidence.after.min_count', value: '1', valueType: 'int', description: 'Minimum AFTER evidence photos required' },
  { key: 'evidence.max_file_mb', value: '10', valueType: 'int', description: 'Maximum file size for evidence uploads (MB)' },
  { key: 'strike.window.days', value: '30', valueType: 'int', description: 'Strike expiration window in days' },
  { key: 'strike.customer.threshold', value: '2', valueType: 'int', description: 'Customer strike threshold before suspension' },
  { key: 'strike.technician.threshold', value: '2', valueType: 'int', description: 'Technician strike threshold before suspension' },
  { key: 'customer.suspension.hours', value: '72', valueType: 'int', description: 'Customer suspension duration in hours' },
  { key: 'technician.suspension.hours', value: '72', valueType: 'int', description: 'Technician suspension duration in hours' },
  { key: 'cancel.grace_minutes_after_accept', value: '15', valueType: 'int', description: 'Grace period for free cancellation after accept (minutes)' },
  { key: 'compensation.arrival.amount', value: '50000', valueType: 'bigint', description: 'Arrival compensation amount (VND) — awaiting PO decision' },
  { key: 'commission.base', value: 'LABOR', valueType: 'enum', description: 'Commission base: LABOR or TOTAL — awaiting PO decision' },
  { key: 'commission.rate_bps', value: '1000', valueType: 'int', description: 'Commission rate in basis points (1000 = 10%) — awaiting PO decision' },
  { key: 'additional_cost.approval_ttl_minutes', value: '60', valueType: 'int', description: 'Additional cost approval timeout (minutes)' },
  { key: 'warranty.default_days', value: '30', valueType: 'int', description: 'Default warranty period in days' },
  { key: 'warranty.max_days', value: '365', valueType: 'int', description: 'Maximum warranty period in days' },
  { key: 'ai.provider', value: 'stub', valueType: 'enum', description: 'AI provider: stub | gemini | openai | fixhome' },
  { key: 'ai.timeout_ms', value: '15000', valueType: 'int', description: 'AI service timeout (milliseconds)' },
  { key: 'ai.rate_limit_per_user_per_hour', value: '10', valueType: 'int', description: 'AI requests per user per hour' },
  { key: 'payment.mode', value: 'DEMO', valueType: 'enum', description: 'Payment mode: DEMO (manual marking) or LIVE' },
];

export async function seedConfig(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository('system_configs');

  for (const item of CONFIG_SEED) {
    const exists = await repo.findOneBy({ key: item.key });
    if (!exists) {
      await repo.insert({
        key: item.key,
        value: item.value,
        valueType: item.valueType,
        description: item.description,
      });
    }
  }

  console.log(`✅ Seeded ${CONFIG_SEED.length} system_config keys`);
}
