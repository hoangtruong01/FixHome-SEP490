// src/types/auth.types.ts
export interface LoginRequest {
  email?: string;
  identifier?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: UserRole;
  status: string;
  avatarUrl?: string | null;
  bookingSuspendedUntil?: string | null;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  TECHNICIAN = 'TECHNICIAN',
  SERVICE_MANAGER = 'SERVICE_MANAGER',
  ADMIN = 'ADMIN',
}
