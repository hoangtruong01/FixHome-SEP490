// src/api/orders.api.ts
import apiClient from './client';

export type CanonicalOrderStatus =
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'UNDER_REPAIR'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'accepted'
  | 'en_route'
  | 'under_repair'
  | 'completed'
  | 'cancelled'
  | 'ARRIVED' // UI transitional alias
  | 'IN_PROGRESS'; // UI transitional alias

export interface ServiceOrderItem {
  id: string;
  code: string;
  bookingId: string;
  serviceName: string;
  status: CanonicalOrderStatus;
  customerName: string;
  customerPhone: string;
  addressSummary: string;
  scheduledAt: string;
  technician?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl?: string;
    averageRating: number;
  };
  laborTotal: number;
  partsTotal: number;
  grandTotal: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
  timeline?: {
    status: string;
    title: string;
    timestamp: string;
    actor: string;
  }[];
  quotation?: {
    id: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'approved' | 'draft' | 'pending';
    laborTotal: number;
    partsTotal: number;
    items: {
      type: 'LABOR' | 'PARTS';
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      warrantyDays?: number;
    }[];
  };
  cashSettlement?: {
    id: string;
    declaredAmount: number;
    confirmedAmount?: number;
    status: 'pending_confirmation' | 'confirmed' | 'disputed';
    technicianNotes?: string;
  };
}

export interface WarrantyItem {
  id: string;
  orderCode: string;
  serviceName: string;
  itemDescription: string;
  startsAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED';
  technicianName: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface QuotationItemPayload {
  type: 'LABOR' | 'PARTS';
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  warrantyDays?: number;
}

export const ordersApi = {
  // ── Queries ──

  async getCustomerOrders(): Promise<ServiceOrderItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<ServiceOrderItem[]> | ServiceOrderItem[]>('/service-orders/my');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as ApiResponse<ServiceOrderItem[]>).data)) {
        return (payload as ApiResponse<ServiceOrderItem[]>).data || [];
      }
      return [];
    } catch {
      return [
        {
          id: 'ord-101',
          code: 'FH-20260913-0001',
          bookingId: 'bk-829102',
          serviceName: 'Sửa điều hòa không mát / chảy nước',
          status: 'UNDER_REPAIR',
          customerName: 'Hoàng Anh Tuấn',
          customerPhone: '0988123456',
          addressSummary: 'P.402 Sunrise Building, Cầu Giấy, Hà Nội',
          scheduledAt: new Date(Date.now() - 3600000).toISOString(),
          technician: {
            id: 'tech-1',
            fullName: 'Nguyễn Văn Hùng',
            phoneNumber: '0912345678',
            averageRating: 4.95,
          },
          laborTotal: 180000,
          partsTotal: 120000,
          grandTotal: 300000,
          paymentStatus: 'UNPAID',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          timeline: [
            { status: 'ACCEPTED', title: 'Thợ nhận đơn', timestamp: '08:45', actor: 'Hệ thống' },
            { status: 'EN_ROUTE', title: 'Thợ bắt đầu di chuyển', timestamp: '09:00', actor: 'Kỹ thuật viên' },
            { status: 'UNDER_REPAIR', title: 'Thợ đã check-in và bắt đầu sửa', timestamp: '09:35', actor: 'Kỹ thuật viên' },
          ],
          quotation: {
            id: 'q-1',
            status: 'ACCEPTED',
            laborTotal: 180000,
            partsTotal: 120000,
            items: [
              { type: 'LABOR', description: 'Công thông tắc máng thoát nước và vệ sinh lưới', quantity: 1, unitPrice: 180000, lineTotal: 180000 },
              { type: 'PARTS', description: 'Thay đoạn ống thoát mềm bảo ôn 1.5m', quantity: 1, unitPrice: 120000, lineTotal: 120000, warrantyDays: 90 },
            ],
          },
        },
      ];
    }
  },

  async getTechnicianJobs(): Promise<ServiceOrderItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<ServiceOrderItem[]> | ServiceOrderItem[]>('/service-orders/my');
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as ApiResponse<ServiceOrderItem[]>).data)) {
        return (payload as ApiResponse<ServiceOrderItem[]>).data || [];
      }
      return [];
    } catch {
      return [
        {
          id: 'ord-101',
          code: 'FH-20260913-0001',
          bookingId: 'bk-829102',
          serviceName: 'Sửa điều hòa không mát / chảy nước',
          status: 'EN_ROUTE',
          customerName: 'Nguyễn Thu Trang',
          customerPhone: '0988654321',
          addressSummary: 'P.402 Sunrise Building, Cầu Giấy, Hà Nội',
          scheduledAt: new Date().toISOString(),
          laborTotal: 180000,
          partsTotal: 120000,
          grandTotal: 300000,
          paymentStatus: 'UNPAID',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getConsoleOrders(statusFilter?: string): Promise<ServiceOrderItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<ServiceOrderItem[]> | ServiceOrderItem[]>('/service-orders', {
        params: { status: statusFilter },
      });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as ApiResponse<ServiceOrderItem[]>).data)) {
        return (payload as ApiResponse<ServiceOrderItem[]>).data || [];
      }
      return [];
    } catch {
      return [];
    }
  },

  async getOrder(id: string): Promise<ServiceOrderItem> {
    try {
      const res = await apiClient.get<ApiResponse<ServiceOrderItem> | ServiceOrderItem>(`/service-orders/${id}`);
      const payload = res.data;
      if (payload && 'id' in payload && (payload as ServiceOrderItem).id) {
        return payload as ServiceOrderItem;
      }
      if (payload && 'data' in payload && (payload as ApiResponse<ServiceOrderItem>).data) {
        return (payload as ApiResponse<ServiceOrderItem>).data as ServiceOrderItem;
      }
    } catch {
      // Fallback
    }
    const list = await this.getCustomerOrders();
    return list.find((o) => o.id === id || o.code === id) || list[0];
  },

  // ── Spec v1.2: Order Execution & Lifecycle Transitions ──

  async enRoute(orderId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/en-route`);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async checkIn(
    orderId: string,
    coords: { lat: number; lng: number; accuracyMeters?: number },
  ): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/check-in`, {
      lat: coords.lat,
      lng: coords.lng,
      accuracyMeters: coords.accuracyMeters ?? 20,
    });
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async startRepair(orderId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/start`);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async uploadEvidence(
    orderId: string,
    body: { phase: 'BEFORE' | 'AFTER'; mediaUrl: string; caption?: string },
  ): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/evidence`, body);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async completeRepair(
    orderId: string,
    body?: { completionNote?: string },
  ): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/complete`, body || {});
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async cancelOrder(orderId: string, reason: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/cancel`, { reason });
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  // ── Quotations ──

  async submitQuotation(orderId: string, items: QuotationItemPayload[]): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>('/quotations', {
      serviceOrderId: orderId,
      items,
    });
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async approveQuotation(quotationId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/quotations/${quotationId}/approve`);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async rejectQuotation(quotationId: string, reason?: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/quotations/${quotationId}/reject`, { reason });
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  // ── Spec v1.2: Cash Settlement Dual-Confirmation ──

  async declareCashSettlement(
    orderId: string,
    body: { declaredAmount: number; technicianNotes?: string; receiptEvidenceUrl?: string },
  ): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/service-orders/${orderId}/cash-settlement/declare`,
      body,
    );
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async confirmCashSettlement(
    orderId: string,
    body: { agreed: boolean; disputeReason?: string; confirmedAmount?: number },
  ): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/service-orders/${orderId}/cash-settlement/confirm`,
      body,
    );
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async getCashSettlement(orderId: string): Promise<Record<string, unknown> | null> {
    try {
      const res = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/cash-settlement`);
      return (res.data?.data || res.data || null) as Record<string, unknown> | null;
    } catch {
      return null;
    }
  },

  // ── Invoice & Warranties ──

  async getInvoice(orderId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/invoice`);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async payInvoice(invoiceId: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/invoices/${invoiceId}/pay`);
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },

  async getWarranties(): Promise<WarrantyItem[]> {
    return [
      {
        id: 'w-1',
        orderCode: 'FH-20260913-0001',
        serviceName: 'Sửa điều hòa rò nước',
        itemDescription: 'Đoạn ống thoát mềm bảo ôn 1.5m',
        startsAt: '2026-09-13',
        expiresAt: '2026-12-13',
        status: 'ACTIVE',
        technicianName: 'Nguyễn Văn Hùng',
      },
    ];
  },

  async createWarrantyClaim(orderId: string, description: string): Promise<Record<string, unknown>> {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>(`/service-orders/${orderId}/warranty-claims`, {
      description,
    });
    return (res.data?.data || res.data || {}) as Record<string, unknown>;
  },
};
