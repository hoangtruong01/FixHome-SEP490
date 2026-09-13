<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import {
  CalendarPlus,
  ShieldCheck,
  History,
  ArrowRight,
  Clock,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhMoney,
} from '../../components';

const router = useRouter();
const authStore = useAuthStore();

const recentOrders = [
  {
    id: 'ord-01',
    code: 'FH-20260913-0001',
    service: 'Vệ sinh máy lạnh Inverter Daikin',
    technician: 'Trần Văn Hoàng',
    status: 'UNDER_REPAIR',
    scheduledAt: 'Hôm nay, 14:30',
    total: 430000,
  },
  {
    id: 'ord-02',
    code: 'FH-20260910-0012',
    service: 'Sửa rò rỉ van nước bồn rửa chén',
    technician: 'Lê Minh Tuấn',
    status: 'COMPLETED',
    scheduledAt: '10/09/2026, 09:00',
    total: 220000,
  },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Xin chào, {{ authStore.user?.fullName }}!
        </h1>
        <p class="text-sm text-ink-500">
          Quản lý lịch sửa chữa thiết bị và các dịch vụ bảo hành gia đình của bạn.
        </p>
      </div>

      <FhButton
        variant="primary"
        size="md"
        @click="router.push('/app/bookings/new')"
      >
        <CalendarPlus :size="18" />
        Tạo yêu cầu mới
      </FhButton>
    </div>

    <!-- Quick Services / Action Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <FhCard clickable class="space-y-3" @click="router.push('/app/bookings/new')">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-brand-50 text-brand-600 flex items-center justify-center">
          <CalendarPlus :size="20" />
        </div>
        <h3 class="text-base font-semibold text-ink-900">Đặt dịch vụ sửa chữa</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Mô tả lỗi hoặc chụp ảnh để nhận chẩn đoán AI và báo giá ước tính.
        </p>
      </FhCard>

      <FhCard clickable class="space-y-3" @click="router.push('/app/warranties')">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-success-50 text-success-600 flex items-center justify-center">
          <ShieldCheck :size="20" />
        </div>
        <h3 class="text-base font-semibold text-ink-900">Bảo hành điện tử</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Xem thời hạn và điều kiện bảo hành các thiết bị đã qua sửa chữa.
        </p>
      </FhCard>

      <FhCard clickable class="space-y-3" @click="router.push('/app/history')">
        <div class="w-10 h-10 rounded-[var(--radius-sm)] bg-info-50 text-info-600 flex items-center justify-center">
          <History :size="20" />
        </div>
        <h3 class="text-base font-semibold text-ink-900">Lịch sử thiết bị (D-20)</h3>
        <p class="text-xs text-ink-500 leading-relaxed">
          Tra cứu toàn bộ lịch sử sửa chữa, vật tư thay thế theo địa chỉ nhà.
        </p>
      </FhCard>
    </div>

    <!-- Recent Orders List -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink-900">Đơn sửa chữa gần đây</h2>
        <router-link to="/app/orders" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          Xem tất cả <ArrowRight :size="14" />
        </router-link>
      </div>

      <div class="space-y-3">
        <FhCard
          v-for="order in recentOrders"
          :key="order.id"
          clickable
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          @click="router.push(`/app/orders/${order.id}`)"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-num font-bold text-ink-500">{{ order.code }}</span>
              <FhStatusPill :status="order.status" />
            </div>
            <h4 class="text-base font-semibold text-ink-900">{{ order.service }}</h4>
            <div class="text-xs text-ink-500 flex items-center gap-3">
              <span>Thợ: <strong class="text-ink-700">{{ order.technician }}</strong></span>
              <span>•</span>
              <span class="flex items-center gap-1"><Clock :size="12" /> {{ order.scheduledAt }}</span>
            </div>
          </div>

          <div class="text-right sm:border-l sm:border-ink-100 sm:pl-6 flex sm:flex-col justify-between items-center sm:items-end">
            <span class="text-xs text-ink-500">Chi phí:</span>
            <FhMoney :amount="order.total" emphasis />
          </div>
        </FhCard>
      </div>
    </div>
  </div>
</template>
