<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-vue-next';
import {
  FhButton,
  FhCard,
  FhStatCard,
  FhStatusPill,
  FhCountdown,
} from '../../components';

const router = useRouter();
const authStore = useAuthStore();
const invitationExpires = new Date(Date.now() + 12 * 60 * 1000); // 12 mins left
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded">
          <ShieldCheck :size="14" />
          Kỹ thuật viên đã xác minh
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          Chào buổi làm việc, {{ authStore.user?.fullName }}!
        </h1>
        <p class="text-sm text-ink-500">
          Khu vực nhận việc: Quận 1, Quận 3, Bình Thạnh (TP. Hồ Chí Minh).
        </p>
      </div>

      <FhButton variant="secondary" size="md" @click="router.push('/tech/schedule')">
        Quản lý lịch làm việc
      </FhButton>
    </div>

    <!-- Stat Cards Grid (All 3 parts present per P7.7) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <FhStatCard
        title="Việc cần làm hôm nay"
        value="3"
        :delta="15"
        delta-label="so với hôm qua"
        :sparkline-data="[1, 2, 2, 4, 3, 2, 3]"
      />
      <FhStatCard
        title="Thu nhập tháng này"
        value="8.450.000 ₫"
        :delta="8.2"
        delta-label="so với tháng trước"
        :sparkline-data="[4, 5, 6, 7, 7, 8, 8.4]"
      />
      <FhStatCard
        title="Đánh giá trung bình"
        value="4.92 ★"
        :delta="0.1"
        delta-label="điểm hài lòng"
        :sparkline-data="[4.8, 4.85, 4.88, 4.9, 4.9, 4.92, 4.92]"
      />
      <FhStatCard
        title="Điểm uy tín (Reliability)"
        value="100 / 100"
        :delta="0"
        delta-label="không có vi phạm"
        :sparkline-data="[100, 100, 100, 100, 100, 100, 100]"
      />
    </div>

    <!-- Urgent Invitation Banner -->
    <div class="p-5 rounded-[var(--radius-md)] bg-warning-50/70 border border-warning-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-warning-700">Lời mời nhận việc mới</span>
          <FhCountdown :expires-at="invitationExpires" />
        </div>
        <h3 class="text-base font-bold text-ink-900">
          Sửa rò rỉ đường ống nước gia đình · 142 Nguyễn Thị Minh Khai, Q.3 (Cách 1.8 km)
        </h3>
        <p class="text-xs text-ink-600">
          Yêu cầu đến vào lúc: 15:00 Hôm nay · Giá tham khảo: 200.000 ₫ - 350.000 ₫
        </p>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <FhButton variant="secondary" size="sm" class="flex-1 sm:flex-none">
          Từ chối
        </FhButton>
        <FhButton variant="primary" size="sm" class="flex-1 sm:flex-none" @click="router.push('/tech/invitations')">
          Xem & Nhận đơn
        </FhButton>
      </div>
    </div>

    <!-- Active Job Workspace Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink-900">Công việc đang thực hiện</h2>
        <router-link to="/tech/jobs" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          Xem tất cả đơn <ArrowRight :size="14" />
        </router-link>
      </div>

      <FhCard class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-100 pb-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-num font-bold text-ink-500">#FH-20260913-0001</span>
              <FhStatusPill status="UNDER_REPAIR" />
            </div>
            <h3 class="text-lg font-bold text-ink-900">
              Vệ sinh & Bơm ga máy lạnh Inverter Daikin
            </h3>
            <p class="text-xs text-ink-500 flex items-center gap-2">
              <MapPin :size="13" /> 28 Lê Duẩn, P. Bến Nghé, Quận 1 · Khách: Nguyễn Văn An (0908 123 456)
            </p>
          </div>

          <FhButton variant="primary" size="md" @click="router.push('/tech/jobs/ord-01')">
            Mở không gian thực thi
          </FhButton>
        </div>

        <!-- Sequential Checklist per P8.8 -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-medium">
          <div class="p-3 bg-success-50 text-success-700 rounded-[var(--radius-sm)] border border-success-200 flex items-center gap-2">
            <CheckCircle2 :size="16" />
            <span>1. GPS Check-in hợp lệ</span>
          </div>
          <div class="p-3 bg-success-50 text-success-700 rounded-[var(--radius-sm)] border border-success-200 flex items-center gap-2">
            <CheckCircle2 :size="16" />
            <span>2. Ảnh BEFORE (2 ảnh)</span>
          </div>
          <div class="p-3 bg-brand-50 text-brand-700 rounded-[var(--radius-sm)] border border-brand-200 flex items-center gap-2 font-bold">
            <Clock :size="16" />
            <span>3. Lập báo giá (Đã duyệt)</span>
          </div>
          <div class="p-3 bg-ink-50 text-ink-400 rounded-[var(--radius-sm)] border border-ink-200 flex items-center gap-2">
            <span>4. Chụp ảnh AFTER & Hoàn tất</span>
          </div>
        </div>
      </FhCard>
    </div>
  </div>
</template>
