// src/api/catalog.api.ts
import apiClient from './client';

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  slug?: string | null;
  iconKey?: string | null;
  sortOrder: number;
  description?: string | null;
  isActive: boolean;
  services?: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  category?: ServiceCategory;
  name: string;
  code: string;
  slug?: string | null;
  description?: string | null;
  pricingMode?: 'FIXED_PRICE' | 'INSPECTION_REQUIRED' | 'fixed_price' | 'inspection_required';
  unit?: string | null;
  fixedPrice?: number | null;
  scopeDescription?: string | null;
  basePrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  basePriceMin?: number;
  basePriceMax?: number;
  estimatedMinutes: number;
  isActive: boolean;
}

export const catalogApi = {
  // Public Category endpoints
  async getCategories(onlyActive = true): Promise<ServiceCategory[]> {
    const res = await apiClient.get<ServiceCategory[]>('/categories');
    const data = res.data;
    return onlyActive ? data.filter((c) => c.isActive) : data;
  },

  async getCategory(idOrSlug: string): Promise<ServiceCategory> {
    const res = await apiClient.get<ServiceCategory>(`/categories/${idOrSlug}`);
    return res.data;
  },

  // Admin Category endpoints
  async getAdminCategories(): Promise<ServiceCategory[]> {
    const res = await apiClient.get<ServiceCategory[]>('/admin/categories');
    return res.data;
  },

  async createCategory(dto: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const res = await apiClient.post<ServiceCategory>('/admin/categories', dto);
    return res.data;
  },

  async updateCategory(id: string, dto: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const res = await apiClient.patch<ServiceCategory>(`/admin/categories/${id}`, dto);
    return res.data;
  },

  async toggleCategoryStatus(id: string, isActive: boolean): Promise<ServiceCategory> {
    const res = await apiClient.patch<ServiceCategory>(`/admin/categories/${id}/status`, { isActive });
    return res.data;
  },

  // Public Service endpoints
  async getServices(params?: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ServiceItem[]; meta: { total: number } }> {
    const res = await apiClient.get<{ data: ServiceItem[]; meta: { total: number } }>('/services', { params });
    return res.data;
  },

  async getService(idOrSlug: string): Promise<ServiceItem> {
    const res = await apiClient.get<ServiceItem>(`/services/${idOrSlug}`);
    return res.data;
  },

  // Admin Service endpoints
  async getAdminServices(params?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: ServiceItem[]; meta: { total: number } }> {
    const res = await apiClient.get<{ data: ServiceItem[]; meta: { total: number } }>('/admin/services', { params });
    return res.data;
  },

  async createService(dto: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await apiClient.post<ServiceItem>('/admin/services', dto);
    return res.data;
  },

  async updateService(id: string, dto: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await apiClient.patch<ServiceItem>(`/admin/services/${id}`, dto);
    return res.data;
  },

  async toggleServiceStatus(id: string, isActive: boolean): Promise<ServiceItem> {
    const res = await apiClient.patch<ServiceItem>(`/admin/services/${id}/status`, { isActive });
    return res.data;
  },
};
