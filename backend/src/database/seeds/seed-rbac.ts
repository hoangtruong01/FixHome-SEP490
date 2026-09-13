// src/database/seeds/seed-rbac.ts
// D-18, P5.2: Seed roles, permissions, and role_permissions.
// The permission catalog here MUST match P5.2 of BUILD-BRIEF v2.0 exactly.
// AC-15 test: count of role_permissions rows must equal the number of ✅ cells in P5.2.

import { DataSource } from 'typeorm';

const ROLES = [
  { code: 'customer', name: 'Customer', description: 'End user who books repair services', isSystem: true },
  { code: 'technician', name: 'Technician', description: 'Service provider who performs repairs', isSystem: true },
  { code: 'service_manager', name: 'Service Manager', description: 'Operations manager who oversees service delivery', isSystem: true },
  { code: 'admin', name: 'Admin', description: 'System administrator with full access', isSystem: true },
];

/**
 * Permission catalog — D-17 naming: `resource:action_scope`.
 * Each entry: [code, resource, action, description]
 */
const PERMISSIONS: [string, string, string, string][] = [
  // Profile
  ['profile:read_own', 'profile', 'read_own', 'Read own profile'],
  ['profile:update_own', 'profile', 'update_own', 'Update own profile'],
  // User management
  ['user:read_all', 'user', 'read_all', 'Read all users'],
  ['user:lock', 'user', 'lock', 'Lock/unlock user accounts'],
  // Technician management
  ['technician:verify', 'technician', 'verify', 'Verify technician profiles'],
  ['technician:assign', 'technician', 'assign', 'Manually assign technician'],
  // Service catalog
  ['service:read', 'service', 'read', 'Read service catalog'],
  ['service:manage', 'service', 'manage', 'Manage service catalog'],
  // Booking
  ['booking:create', 'booking', 'create', 'Create a booking'],
  ['booking:read_own', 'booking', 'read_own', 'Read own bookings'],
  ['booking:read_invited', 'booking', 'read_invited', 'Read bookings where invited'],
  ['booking:read_all', 'booking', 'read_all', 'Read all bookings'],
  ['booking:cancel_own', 'booking', 'cancel_own', 'Cancel own booking'],
  // AI Diagnosis
  ['ai_diagnosis:create', 'ai_diagnosis', 'create', 'Create AI diagnosis'],
  ['ai_diagnosis:read_related', 'ai_diagnosis', 'read_related', 'Read related AI diagnoses'],
  // Invitation / Matching
  ['invitation:shortlist', 'invitation', 'shortlist', 'Create shortlist of technicians'],
  ['invitation:respond', 'invitation', 'respond', 'Respond to invitation (accept/decline)'],
  ['assignment:override', 'assignment', 'override', 'Override technician assignment'],
  // Messaging (person-to-person chat)
  ['message:read_thread', 'message', 'read_thread', 'Read message thread'],
  ['message:write_thread', 'message', 'write_thread', 'Write to message thread'],
  // AI Chatbot
  ['chatbot:use', 'chatbot', 'use', 'Use AI chatbot'],
  ['chatbot:monitor', 'chatbot', 'monitor', 'Monitor AI chatbot usage'],
  // Order
  ['order:read_related', 'order', 'read_related', 'Read related service orders'],
  ['order:update_status', 'order', 'update_status', 'Update order status (transitions)'],
  ['order:cancel', 'order', 'cancel', 'Cancel a service order'],
  ['order:read_status_history', 'order', 'read_status_history', 'Read order status history'],
  // Arrival check-in
  ['arrival_checkin:create', 'arrival_checkin', 'create', 'Create arrival check-in'],
  ['arrival_checkin:read_related', 'arrival_checkin', 'read_related', 'Read related check-ins'],
  // Evidence
  ['evidence:upload', 'evidence', 'upload', 'Upload repair evidence'],
  ['evidence:read_related', 'evidence', 'read_related', 'Read related evidence'],
  // Quotation
  ['quotation:create', 'quotation', 'create', 'Create quotation'],
  ['quotation:read_related', 'quotation', 'read_related', 'Read related quotations'],
  ['quotation:approve', 'quotation', 'approve', 'Approve quotation'],
  ['quotation:reject', 'quotation', 'reject', 'Reject quotation'],
  // Additional cost
  ['additional_cost:create', 'additional_cost', 'create', 'Create additional cost request'],
  ['additional_cost:approve', 'additional_cost', 'approve', 'Approve additional cost'],
  ['additional_cost:reject', 'additional_cost', 'reject', 'Reject additional cost'],
  ['additional_cost:revise', 'additional_cost', 'revise', 'Revise additional cost'],
  // Warranty
  ['warranty:define', 'warranty', 'define', 'Define warranty terms'],
  ['warranty:read_related', 'warranty', 'read_related', 'Read related warranties'],
  // Invoice
  ['invoice:read_related', 'invoice', 'read_related', 'Read related invoices'],
  ['invoice:pay_own', 'invoice', 'pay_own', 'Pay own invoice'],
  // Strike & Compensation
  ['strike:read_all', 'strike', 'read_all', 'Read all strikes'],
  ['strike:waive', 'strike', 'waive', 'Waive a strike'],
  ['compensation:decide', 'compensation', 'decide', 'Decide on compensation'],
  // Rating
  ['rating:create_own_order', 'rating', 'create_own_order', 'Create rating for own order'],
  ['rating:moderate', 'rating', 'moderate', 'Moderate ratings'],
  // Repair history
  ['history:read_related', 'history', 'read_related', 'Read related repair history'],
  // Config
  ['config:read', 'config', 'read', 'Read system configuration'],
  ['config:update', 'config', 'update', 'Update system configuration'],
  // Audit
  ['audit:read', 'audit', 'read', 'Read audit logs'],
  // Dashboard
  ['dashboard:read_own', 'dashboard', 'read_own', 'Read own dashboard'],
  ['dashboard:read_operational', 'dashboard', 'read_operational', 'Read operational dashboard'],
  ['dashboard:read_system', 'dashboard', 'read_system', 'Read system dashboard'],
];

/**
 * Role→Permission mappings per P5.2.
 * Map<roleCode, permissionCode[]>
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  customer: [
    'profile:read_own', 'profile:update_own',
    'service:read',
    'booking:create', 'booking:read_own', 'booking:cancel_own',
    'ai_diagnosis:create', 'ai_diagnosis:read_related',
    'invitation:shortlist',
    'message:read_thread', 'message:write_thread',
    'chatbot:use',
    'order:read_related', 'order:cancel', 'order:read_status_history',
    'arrival_checkin:read_related',
    'evidence:read_related',
    'quotation:read_related', 'quotation:approve', 'quotation:reject',
    'additional_cost:approve', 'additional_cost:reject',
    'warranty:read_related',
    'invoice:read_related', 'invoice:pay_own',
    'rating:create_own_order',
    'history:read_related',
    'dashboard:read_own',
  ],
  technician: [
    'profile:read_own', 'profile:update_own',
    'service:read',
    'booking:read_invited',
    'ai_diagnosis:read_related',
    'invitation:respond',
    'message:read_thread', 'message:write_thread',
    'chatbot:use',
    'order:read_related', 'order:update_status', 'order:cancel', 'order:read_status_history',
    'arrival_checkin:create', 'arrival_checkin:read_related',
    'evidence:upload', 'evidence:read_related',
    'quotation:create', 'quotation:read_related',
    'additional_cost:create', 'additional_cost:revise',
    'warranty:define', 'warranty:read_related',
    'invoice:read_related',
    'history:read_related',
    'dashboard:read_own',
  ],
  service_manager: [
    'profile:read_own', 'profile:update_own',
    'user:read_all',
    'technician:verify', 'technician:assign',
    'service:read', 'service:manage',
    'booking:read_all',
    'ai_diagnosis:read_related',
    'assignment:override',
    'chatbot:use',
    'order:read_related', 'order:update_status', 'order:cancel', 'order:read_status_history',
    'arrival_checkin:read_related',
    'evidence:read_related',
    'quotation:read_related',
    'warranty:read_related',
    'invoice:read_related',
    'strike:read_all', 'strike:waive',
    'compensation:decide',
    'rating:moderate',
    'history:read_related',
    'config:read',
    'audit:read',
    'dashboard:read_operational',
  ],
  admin: [
    'profile:read_own', 'profile:update_own',
    'user:read_all', 'user:lock',
    'technician:verify', 'technician:assign',
    'service:read', 'service:manage',
    'booking:read_all',
    'ai_diagnosis:read_related',
    'assignment:override',
    'message:read_thread', // Admin read-only on threads
    'chatbot:use', 'chatbot:monitor',
    'order:read_related', 'order:update_status', 'order:cancel', 'order:read_status_history',
    'arrival_checkin:read_related',
    'evidence:read_related',
    'quotation:read_related',
    'warranty:read_related',
    'invoice:read_related',
    'strike:read_all', 'strike:waive',
    'compensation:decide',
    'rating:moderate',
    'history:read_related',
    'config:read', 'config:update',
    'audit:read',
    'dashboard:read_operational', 'dashboard:read_system',
  ],
};

export async function seedRbac(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository('roles');
  const permRepo = dataSource.getRepository('permissions');
  const rpRepo = dataSource.getRepository('role_permissions');

  // 1. Seed roles
  const roleMap = new Map<string, string>(); // code → id
  for (const role of ROLES) {
    let existing = await roleRepo.findOneBy({ code: role.code });
    if (!existing) {
      const result = await roleRepo.insert(role);
      existing = { id: result.identifiers[0].id, ...role };
    }
    roleMap.set(role.code, existing.id);
  }
  console.log(`✅ Seeded ${ROLES.length} roles`);

  // 2. Seed permissions
  const permMap = new Map<string, string>(); // code → id
  for (const [code, resource, action, description] of PERMISSIONS) {
    let existing = await permRepo.findOneBy({ code });
    if (!existing) {
      const result = await permRepo.insert({ code, resource, action, description });
      existing = { id: result.identifiers[0].id };
    }
    permMap.set(code, existing.id);
  }
  console.log(`✅ Seeded ${PERMISSIONS.length} permissions`);

  // 3. Seed role_permissions
  let mappingCount = 0;
  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleCode);
    if (!roleId) continue;

    for (const permCode of permCodes) {
      const permissionId = permMap.get(permCode);
      if (!permissionId) {
        console.warn(`⚠️ Permission "${permCode}" not found for role "${roleCode}"`);
        continue;
      }

      const exists = await rpRepo.findOneBy({ roleId, permissionId });
      if (!exists) {
        await rpRepo.insert({ roleId, permissionId });
        mappingCount++;
      }
    }
  }
  console.log(`✅ Seeded ${mappingCount} role_permission mappings`);
}
