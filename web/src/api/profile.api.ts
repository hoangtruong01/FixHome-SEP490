// src/api/profile.api.ts
import apiClient from './client';

export interface UserAddress {
  id: string;
  userId: string;
  label?: string | null;
  line1: string;
  ward?: string | null;
  district: string;
  province: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
  bookingSuspendedUntil?: string | null;
  permissions?: string[];
}

export const profileApi = {
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>('/me');
    return res.data;
  },

  async updateMe(dto: {
    fullName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }): Promise<UserProfile> {
    const res = await apiClient.patch<UserProfile>('/me', dto);
    return res.data;
  },

  async getAddresses(): Promise<UserAddress[]> {
    const res = await apiClient.get<UserAddress[]>('/me/addresses');
    return res.data;
  },

  async createAddress(dto: {
    label?: string;
    line1: string;
    ward?: string;
    district: string;
    province: string;
    isDefault?: boolean;
  }): Promise<UserAddress> {
    const res = await apiClient.post<UserAddress>('/me/addresses', dto);
    return res.data;
  },

  async updateAddress(
    id: string,
    dto: Partial<{
      label: string;
      line1: string;
      ward: string;
      district: string;
      province: string;
      isDefault: boolean;
    }>,
  ): Promise<UserAddress> {
    const res = await apiClient.patch<UserAddress>(`/me/addresses/${id}`, dto);
    return res.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/me/addresses/${id}`);
  },
};
