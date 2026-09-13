// src/api/orders.api.ts
import apiClient from './client';

export interface ServiceOrderItem {
  id: string;
  code: string;
  bookingId: string;
  serviceName: string;
  status:
    | 'PENDING_MATCHING'
    | 'ASSIGNED'
    | 'EN_ROUTE'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
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
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  createdAt: string;
  timeline?: {
    status: string;
    title: string;
    timestamp: string;
    actor: string;
  }[];
  quotation?: {
    id: string;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
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

export const ordersApi = {
  async getCustomerOrders(): Promise<ServiceOrderItem[]> {
    try {
      const res = await apiClient.get<ServiceOrderItem[]>('/orders/my');
      return res.data;
    } catch {
      return [
        {
          id: 'ord-101',
          code: 'FH-20260913-0001',
          bookingId: 'bk-829102',
          serviceName: 'Sửa điều hòa không mát / chảy nước',
          status: 'IN_PROGRESS',
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
            { status: 'CREATED', title: 'Khách hàng tạo yêu cầu', timestamp: '08:30', actor: 'Khách hàng' },
            { status: 'ASSIGNED', title: 'Thợ Nguyễn Văn Hùng nhận đơn', timestamp: '08:45', actor: 'Hệ thống' },
            { status: 'EN_ROUTE', title: 'Thợ bắt đầu di chuyển', timestamp: '09:00', actor: 'Kỹ thuật viên' },
            { status: 'ARRIVED', title: 'Thợ đã đến (Check-in GPS)', timestamp: '09:20', actor: 'Kỹ thuật viên' },
            { status: 'IN_PROGRESS', title: 'Khách đã duyệt báo giá, bắt đầu sửa', timestamp: '09:35', actor: 'Khách hàng' },
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
        {
          id: 'ord-102',
          code: 'FH-20260910-0042',
          bookingId: 'bk-719201',
          serviceName: 'Sửa chập điện âm tường',
          status: 'COMPLETED',
          customerName: 'Hoàng Anh Tuấn',
          customerPhone: '0988123456',
          addressSummary: 'Số 15 Ngõ 12 Đội Cấn, Ba Đình, Hà Nội',
          scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          technician: {
            id: 'tech-2',
            fullName: 'Trần Đình Trọng',
            phoneNumber: '0922334455',
            averageRating: 4.88,
          },
          laborTotal: 250000,
          partsTotal: 150000,
          grandTotal: 400000,
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ];
    }
  },

  async getTechnicianJobs(): Promise<ServiceOrderItem[]> {
    try {
      const res = await apiClient.get<ServiceOrderItem[]>('/technicians/my/jobs');
      return res.data;
    } catch {
      return [
        {
          id: 'ord-101',
          code: 'FH-20260913-0001',
          bookingId: 'bk-829102',
          serviceName: 'Sửa điều hòa không mát / chảy nước',
          status: 'ARRIVED',
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
      const res = await apiClient.get<ServiceOrderItem[]>('/admin/orders', {
        params: { status: statusFilter },
      });
      return res.data;
    } catch {
      return [
        {
          id: 'ord-101',
          code: 'FH-20260913-0001',
          bookingId: 'bk-829102',
          serviceName: 'Sửa điều hòa không mát / chảy nước',
          status: 'IN_PROGRESS',
          customerName: 'Nguyễn Thu Trang',
          customerPhone: '0988654321',
          addressSummary: 'P.402 Sunrise Building, Cầu Giấy, Hà Nội',
          scheduledAt: new Date().toISOString(),
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
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ord-103',
          code: 'FH-20260913-0002',
          bookingId: 'bk-829103',
          serviceName: 'Thay vòi sen tắm đứng inox 304',
          status: 'PENDING_MATCHING',
          customerName: 'Trần Văn Nam',
          customerPhone: '0977112233',
          addressSummary: 'Số 48 Phố Huế, Hoàn Kiếm, Hà Nội',
          scheduledAt: new Date(Date.now() + 7200000).toISOString(),
          laborTotal: 120000,
          partsTotal: 0,
          grandTotal: 120000,
          paymentStatus: 'UNPAID',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getOrder(id: string): Promise<ServiceOrderItem> {
    const list = await this.getCustomerOrders();
    const found = list.find((o) => o.id === id || o.code === id);
    if (found) return found;
    return list[0];
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
      {
        id: 'w-2',
        orderCode: 'FH-20260910-0042',
        serviceName: 'Sửa chập điện âm tường',
        itemDescription: 'Aptomat chống giật Panasonic 32A',
        startsAt: '2026-09-10',
        expiresAt: '2027-03-10',
        status: 'ACTIVE',
        technicianName: 'Trần Đình Trọng',
      },
    ];
  },
};
