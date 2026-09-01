// src/types/auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export enum UserRole {
  CUSTOMER = 'customer',
  TECHNICIAN = 'technician',
  SERVICE_MANAGER = 'service_manager',
  ADMIN = 'admin',
}
