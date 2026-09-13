// src/modules/users/entities/user.entity.spec.ts
import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { User } from './user.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Role, AccountStatus } from '../../../shared/enums';

describe('User and RefreshToken Entities', () => {
  it('instantiates User with appropriate default properties', () => {
    const user = new User();
    user.email = 'test@fixhome.vn';
    user.fullName = 'Nguyen Van A';
    user.passwordHash = 'hashed_secret';
    user.role = Role.CUSTOMER;
    user.status = AccountStatus.ACTIVE;
    user.isActive = true;

    expect(user.email).toBe('test@fixhome.vn');
    expect(user.role).toBe(Role.CUSTOMER);
    expect(user.status).toBe(AccountStatus.ACTIVE);
    expect(user.isActive).toBe(true);
  });

  it('supports AccountStatus enum values (active, locked, suspended)', () => {
    expect(AccountStatus.ACTIVE).toBe('active');
    expect(AccountStatus.LOCKED).toBe('locked');
    expect(AccountStatus.SUSPENDED).toBe('suspended');
  });

  it('instantiates RefreshToken with user relation and token hash', () => {
    const user = new User();
    user.id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

    const token = new RefreshToken();
    token.userId = user.id;
    token.user = user;
    token.tokenHash = 'sha256_hashed_token_string';
    token.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    token.isRevoked = false;
    token.deviceInfo = 'Mobile App - iPhone 15';

    expect(token.userId).toBe(user.id);
    expect(token.tokenHash).toBe('sha256_hashed_token_string');
    expect(token.isRevoked).toBe(false);
    expect(token.deviceInfo).toBe('Mobile App - iPhone 15');
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
