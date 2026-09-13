// src/api/service-areas.api.ts
import apiClient from './client';

export interface ServiceArea {
  id: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const serviceAreasApi = {
  async getServiceAreas(params?: {
    provinceCode?: string;
    isActive?: boolean;
  }): Promise<ServiceArea[]> {
    const res = await apiClient.get<ServiceArea[]>('/service-areas', { params });
    return res.data;
  },

  async getServiceArea(id: string): Promise<ServiceArea> {
    const res = await apiClient.get<ServiceArea>(`/service-areas/${id}`);
    return res.data;
  },

  async createServiceArea(dto: {
    provinceCode: string;
    provinceName: string;
    districtCode: string;
    districtName: string;
    isActive?: boolean;
  }): Promise<ServiceArea> {
    const res = await apiClient.post<ServiceArea>('/service-areas', dto);
    return res.data;
  },

  async updateServiceArea(
    id: string,
    dto: Partial<{
      provinceCode: string;
      provinceName: string;
      districtCode: string;
      districtName: string;
      isActive: boolean;
    }>,
  ): Promise<ServiceArea> {
    const res = await apiClient.patch<ServiceArea>(`/service-areas/${id}`, dto);
    return res.data;
  },

  async toggleStatus(id: string, isActive: boolean): Promise<ServiceArea> {
    const res = await apiClient.patch<ServiceArea>(`/service-areas/${id}/status`, { isActive });
    return res.data;
  },

  async deleteServiceArea(id: string): Promise<void> {
    await apiClient.delete(`/service-areas/${id}`);
  },
};
