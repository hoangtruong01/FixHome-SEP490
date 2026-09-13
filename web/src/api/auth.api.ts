// src/api/auth.api.ts
import apiClient from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '../types';

interface ApiResponse<T> {
  data: T;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse> | LoginResponse>('/auth/login', data);
    return 'data' in res.data ? (res.data as ApiResponse<LoginResponse>).data : res.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse> | LoginResponse>('/auth/register', data);
    return 'data' in res.data ? (res.data as ApiResponse<LoginResponse>).data : res.data;
  },

  getProfile: async (): Promise<UserInfo> => {
    const res = await apiClient.get<ApiResponse<UserInfo> | UserInfo>('/me');
    return 'data' in res.data ? (res.data as ApiResponse<UserInfo>).data : res.data;
  },

  updateProfile: async (data: Partial<UserInfo>): Promise<UserInfo> => {
    const res = await apiClient.patch<ApiResponse<UserInfo> | UserInfo>('/me', data);
    return 'data' in res.data ? (res.data as ApiResponse<UserInfo>).data : res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network error on logout
    }
  },
};
