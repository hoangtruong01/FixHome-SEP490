// src/modules/rbac/entities/role-permission.entity.ts
import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { RoleEntity } from './role.entity';
import { Permission } from './permission.entity';

/**
 * Join table for roles ↔ permissions (D-18).
 * Composite PK on (roleId, permissionId).
 * Seeded at Phase 0 from the permission catalog in P5.2.
 */
@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @PrimaryColumn({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => Permission, (perm) => perm.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
