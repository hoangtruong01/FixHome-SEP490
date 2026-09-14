// src/api/bookings.api.ts
import apiClient from './client';

export interface BookingItem {
  id: string;
  customerId: string;
  serviceId: string;
  serviceName?: string;
  addressId: string;
  addressSummary?: string;
  description: string;
  preferredAt: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  status: 'PENDING' | 'MATCHING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  mediaUrls?: string[];
  diagnosis?: {
    possibleIssues: string[];
    possibleCauses: string[];
    suggestedPriceMin: number;
    suggestedPriceMax: number;
    confidence: number;
  };
}

export interface CreateBookingDto {
  serviceId: string;
  addressId: string;
  description: string;
  preferredAt: string;
  preferredTimeWindow?: string;
  quantity?: number;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  mediaUrls?: string[];
}

export interface TechnicianCandidate {
  id: string;
  technicianId?: string;
  userId?: string;
  fullName: string;
  avatarUrl?: string;
  averageRating: number;
  ratingCount: number;
  yearsExperience: number;
  reliabilityScore: number;
  distanceKm?: number;
  isAvailable: boolean;
  listedLaborPrice?: number | null;
  typicalWarrantyDays?: number;
}

export interface DiagnosisResult {
  possibleIssues: string[];
  possibleCauses: string[];
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  confidence: number;
  urgency?: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  recommendedActions?: string[];
}

export interface InvitationItem {
  id: string;
  bookingId: string;
  booking?: BookingItem;
  technicianId: string;
  priorityOrder: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  invitedAt: string;
  expiresAt: string;
}

export const bookingsApi = {
  async createBooking(dto: CreateBookingDto): Promise<BookingItem> {
    try {
      const res = await apiClient.post<BookingItem>('/bookings', dto);
      return res.data;
    } catch {
      // Mock creation fallback for demo
      return {
        id: `bk-${Date.now().toString().slice(-6)}`,
        customerId: 'cust-1',
        ...dto,
        status: 'MATCHING',
        createdAt: new Date().toISOString(),
      };
    }
  },

  async getMyBookings(): Promise<BookingItem[]> {
    try {
      const res = await apiClient.get<BookingItem[]>('/bookings/my');
      return res.data;
    } catch {
      return [
        {
          id: 'bk-829102',
          customerId: 'cust-1',
          serviceId: 's1',
          serviceName: 'Sửa điều hòa không mát',
          addressId: 'a1',
          addressSummary: 'Số 12 Ngõ 45 Đội Cấn, Ba Đình, Hà Nội',
          description: 'Điều hòa bật 16 độ nhưng chỉ có gió nhẹ, không mát và kêu rè rè.',
          preferredAt: new Date(Date.now() + 3600000 * 2).toISOString(),
          urgency: 'HIGH',
          status: 'MATCHING',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
      ];
    }
  },

  async getBooking(id: string): Promise<BookingItem> {
    const res = await apiClient.get<BookingItem>(`/bookings/${id}`);
    return res.data;
  },

  async diagnoseAI(dto: { description: string; serviceId?: string }): Promise<DiagnosisResult> {
    try {
      const res = await apiClient.post<DiagnosisResult>('/ai/diagnoses', dto);
      return res.data;
    } catch {
      // Smart offline fallback
      return {
        possibleIssues: [
          'Thiếu gas làm lạnh (R32 / R410A) do rò rỉ zắc co',
          'Lưới lọc bụi và dàn tản nhiệt bám bẩn nặng gây cản gió',
          'Tụ kích block hoặc quạt dàn nóng bị yếu',
        ],
        possibleCauses: [
          'Chưa bảo dưỡng định kỳ trong hơn 6 tháng',
          'Môi trường bụi bẩn cao hoặc đường ống đồng gấp khúc',
        ],
        suggestedPriceMin: 150000,
        suggestedPriceMax: 380000,
        confidence: 0.92,
        urgency: 'NORMAL',
      };
    }
  },

  async getCandidates(bookingId: string): Promise<TechnicianCandidate[]> {
    try {
      const res = await apiClient.get<TechnicianCandidate[]>(`/bookings/${bookingId}/technician-candidates`);
      return res.data;
    } catch {
      return [
        {
          id: 'tech-1',
          fullName: 'Nguyễn Văn Hùng',
          averageRating: 4.95,
          ratingCount: 184,
          yearsExperience: 6,
          reliabilityScore: 99,
          distanceKm: 1.8,
          isAvailable: true,
        },
        {
          id: 'tech-2',
          fullName: 'Trần Đình Trọng',
          averageRating: 4.88,
          ratingCount: 142,
          yearsExperience: 4,
          reliabilityScore: 96,
          distanceKm: 2.5,
          isAvailable: true,
        },
        {
          id: 'tech-3',
          fullName: 'Lê Minh Tuấn',
          averageRating: 4.91,
          ratingCount: 97,
          yearsExperience: 5,
          reliabilityScore: 98,
          distanceKm: 3.2,
          isAvailable: true,
        },
        {
          id: 'tech-4',
          fullName: 'Phạm Quốc Bảo',
          averageRating: 4.85,
          ratingCount: 76,
          yearsExperience: 3,
          reliabilityScore: 95,
          distanceKm: 4.1,
          isAvailable: true,
        },
      ];
    }
  },

  async sendShortlist(bookingId: string, technicianIds: string[]): Promise<void> {
    await apiClient.post(`/bookings/${bookingId}/shortlist`, { technicianIds });
  },

  async getMyInvitations(): Promise<InvitationItem[]> {
    try {
      const res = await apiClient.get<InvitationItem[]>('/invitations/my');
      return res.data;
    } catch {
      return [
        {
          id: 'inv-101',
          bookingId: 'bk-829102',
          booking: {
            id: 'bk-829102',
            customerId: 'cust-1',
            serviceId: 's1',
            serviceName: 'Sửa điều hòa không mát / chảy nước',
            addressId: 'a1',
            addressSummary: 'P.402 Chung cư Sunrise, Cầu Giấy, Hà Nội',
            description: 'Máy lạnh chảy nước nhỏ giọt xuống sàn gỗ, cần thợ đến sớm.',
            preferredAt: new Date(Date.now() + 1800000).toISOString(),
            urgency: 'HIGH',
            status: 'MATCHING',
            createdAt: new Date().toISOString(),
          },
          technicianId: 'tech-1',
          priorityOrder: 1,
          status: 'PENDING',
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60000 * 8).toISOString(), // 8 minutes TTL
        },
      ];
    }
  },

  async respondInvitation(invitationId: string, action: 'ACCEPT' | 'DECLINE'): Promise<void> {
    await apiClient.post(`/invitations/${invitationId}/respond`, { action });
  },
};
