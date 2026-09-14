<script setup lang="ts">
import { ref } from 'vue';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-vue-next';
import {
  FhCard,
  FhStatusPill,
  FhMoney,
} from '../../components';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const isAvailable = ref(true);

const technicianProfile = ref({
  verificationStatus: 'APPROVED',
  yearsExperience: 5,
  bio: 'Kỹ thuật viên điện lạnh & điện gia dụng với hơn 5 năm kinh nghiệm. Chuyên sửa điều hòa inverter, máy giặt lồng ngang và xử lý chập điện.',
  averageRating: 4.95,
  ratingCount: 148,
  reliabilityScore: 98,
  skills: [
    { serviceName: 'Sửa điều hòa không mát', level: 'EXPERT', listedLaborPrice: 150000, pricingMode: 'INSPECTION_REQUIRED' },
    { serviceName: 'Vệ sinh điều hòa treo tường 1–1.5 HP', level: 'EXPERT', listedLaborPrice: 180000, pricingMode: 'FIXED_PRICE' },
    { serviceName: 'Sửa chập điện âm tường', level: 'ADVANCED', listedLaborPrice: 200000, pricingMode: 'INSPECTION_REQUIRED' },
    { serviceName: 'Sửa máy giặt lồng ngang', level: 'INTERMEDIATE', listedLaborPrice: 180000, pricingMode: 'INSPECTION_REQUIRED' },
    { serviceName: 'Lắp quạt trần cơ bản', level: 'ADVANCED', listedLaborPrice: 250000, pricingMode: 'FIXED_PRICE' },
  ],
  serviceAreas: [
    { province: 'Hà Nội', district: 'Quận Ba Đình' },
    { province: 'Hà Nội', district: 'Quận Cầu Giấy' },
    { province: 'Hà Nội', district: 'Quận Đống Đa' },
    { province: 'Hà Nội', district: 'Quận Tây Hồ' },
  ],
  schedule: [
    { days: 'Thứ Hai – Thứ Bảy', hours: '08:00 – 18:00' },
    { days: 'Chủ Nhật', hours: '08:00 – 12:00' },
  ],
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">
          Hồ sơ Kỹ thuật viên & Kỹ năng
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Hồ sơ nghiệp vụ đã được Service Manager xác thực danh tính và chứng chỉ hành nghề.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs font-semibold text-ink-700">Trạng thái nhận việc:</span>
        <button
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5"
          :class="isAvailable ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-ink-100 text-ink-600'"
          @click="isAvailable = !isAvailable"
        >
          <span class="w-2 h-2 rounded-full" :class="isAvailable ? 'bg-success-500' : 'bg-ink-400'"></span>
          {{ isAvailable ? 'Đang sẵn sàng' : 'Tạm dừng nhận việc' }}
        </button>
      </div>
    </div>

    <!-- Identity & Verification Banner -->
    <div class="bg-white rounded-[var(--radius-md)] border border-ink-200 p-6 shadow-[var(--shadow-e1)] flex flex-col sm:flex-row items-center gap-6">
      <div class="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
        {{ authStore.user?.fullName?.charAt(0) ?? 'T' }}
      </div>

      <div class="flex-1 space-y-2 text-center sm:text-left">
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h2 class="text-xl font-bold text-ink-900">{{ authStore.user?.fullName }}</h2>
          <FhStatusPill status="COMPLETED" label="ĐÃ XÁC THỰC LÝ LỊCH" />
        </div>

        <p class="text-xs text-ink-600 max-w-xl">
          {{ technicianProfile.bio }}
        </p>

        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-ink-500">
          <span class="flex items-center gap-1 font-semibold text-amber-600">
            ★ {{ technicianProfile.averageRating }} ({{ technicianProfile.ratingCount }} đánh giá)
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <Briefcase :size="14" class="text-brand-600" />
            {{ technicianProfile.yearsExperience }} năm kinh nghiệm
          </span>
          <span>•</span>
          <span class="text-success-600 font-semibold">
            Độ tin cậy: {{ technicianProfile.reliabilityScore }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Skills & Service Areas Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Verified Skills -->
      <FhCard title="Kỹ năng chuyên môn đã duyệt">
        <template #action>
          <span class="text-[11px] text-ink-400 font-mono">{{ technicianProfile.skills.length }} dịch vụ</span>
        </template>

        <div class="space-y-2.5">
          <div
            v-for="skill in technicianProfile.skills"
            :key="skill.serviceName"
            class="p-2.5 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200/80 flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2 :size="15" class="text-brand-600 shrink-0" />
              <span class="text-xs font-semibold text-ink-800">{{ skill.serviceName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="skill.pricingMode === 'INSPECTION_REQUIRED' && skill.listedLaborPrice" class="text-[11px] font-num text-brand-700 font-bold">
                <FhMoney :amount="skill.listedLaborPrice" />
              </span>
              <span v-else-if="skill.pricingMode === 'FIXED_PRICE'" class="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-medium">
                Giá cố định
              </span>
              <span class="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white text-brand-700 border border-brand-200">
                {{ skill.level }}
              </span>
            </div>
          </div>
        </div>
      </FhCard>

      <!-- Service Areas -->
      <FhCard title="Khu vực hoạt động đăng ký">
        <template #action>
          <span class="text-[11px] text-ink-400 font-mono">{{ technicianProfile.serviceAreas.length }} quận</span>
        </template>

        <div class="space-y-2.5">
          <div
            v-for="area in technicianProfile.serviceAreas"
            :key="area.district"
            class="p-2.5 rounded-[var(--radius-sm)] bg-ink-50 border border-ink-200/80 flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <MapPin :size="15" class="text-brand-600 shrink-0" />
              <span class="text-xs font-medium text-ink-800">{{ area.district }}</span>
            </div>
            <span class="text-[11px] text-ink-500">{{ area.province }}</span>
          </div>
        </div>
      </FhCard>
    </div>

    <!-- Working Schedule -->
    <FhCard title="Khung giờ nhận việc tiêu chuẩn">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div
          v-for="slot in technicianProfile.schedule"
          :key="slot.days"
          class="p-3 rounded-[var(--radius-sm)] bg-white border border-ink-200 flex items-center justify-between"
        >
          <span class="font-semibold text-ink-700 flex items-center gap-1.5">
            <Calendar :size="14" class="text-brand-600" /> {{ slot.days }}
          </span>
          <span class="font-num font-bold text-brand-700 flex items-center gap-1">
            <Clock :size="13" /> {{ slot.hours }}
          </span>
        </div>
      </div>

      <p class="text-[11px] text-ink-400 mt-4 flex items-center gap-1">
        <AlertCircle :size="13" />
        Để thay đổi khu vực hoạt động hoặc kỹ năng chuyên môn, vui lòng liên hệ Service Manager khu vực.
      </p>
    </FhCard>
  </div>
</template>
