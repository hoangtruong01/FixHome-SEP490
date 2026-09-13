<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';

import {
  FhButton,
  FhCard,
  FhStatusPill,
  FhTimeline,
  type TimelineStep,
} from '../../components';

const orderCode = ref('');
const phone = ref('');
const searched = ref(false);
const loading = ref(false);

const mockFoundOrder = ref<{
  code: string;
  service: string;
  status: string;
  technician: string;
  steps: TimelineStep[];
} | null>(null);

const handleTrack = () => {
  if (!orderCode.value.trim() || !phone.value.trim()) return;
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    searched.value = true;
    mockFoundOrder.value = {
      code: orderCode.value.trim().toUpperCase(),
      service: 'Vệ sinh & Bơm ga máy lạnh Inverter Daikin',
      status: 'UNDER_REPAIR',
      technician: 'Trần Văn Hoàng (0903 000 001)',
      steps: [
        {
          key: '1',
          label: 'Khách hàng tạo yêu cầu sửa chữa',
          timestamp: '13:00 Hôm nay',
          actor: 'Khách hàng',
          completed: true,
        },
        {
          key: '2',
          label: 'Kỹ thuật viên nhận đơn & xuất phát',
          timestamp: '13:15 Hôm nay',
          actor: 'Trần Văn Hoàng',
          completed: true,
        },
        {
          key: '3',
          label: 'Check-in GPS tại địa chỉ khách hàng',
          timestamp: '13:40 Hôm nay',
          actor: 'Hệ thống xác thực (Hợp lệ)',
          completed: true,
        },
        {
          key: '4',
          label: 'Đang tiến hành sửa chữa & kiểm tra',
          timestamp: 'Hiện tại',
          actor: 'Trần Văn Hoàng',
          current: true,
        },
        {
          key: '5',
          label: 'Chụp ảnh nghiệm thu & Hoàn tất',
          completed: false,
        },
      ],
    };
  }, 600);
};
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
    <div class="text-center space-y-3">
      <h1 class="text-3xl font-bold text-ink-900 tracking-tight">
        Tra cứu tiến độ đơn sửa chữa
      </h1>
      <p class="text-ink-600 text-sm">
        Nhập mã đơn hàng và số điện thoại đã đăng ký để kiểm tra trạng thái thực tế của kỹ thuật viên.
      </p>
    </div>

    <!-- Search Form Box -->
    <FhCard class="space-y-4 shadow-[var(--shadow-e2)]">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleTrack">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1">
            Mã đơn hàng
          </label>
          <input
            v-model="orderCode"
            type="text"
            required
            placeholder="Ví dụ: FH-20260913-0001"
            class="w-full h-11 px-3 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] uppercase font-num placeholder:normal-case focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1">
            Số điện thoại đặt đơn
          </label>
          <input
            v-model="phone"
            type="tel"
            required
            placeholder="Ví dụ: 0901234567"
            class="w-full h-11 px-3 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div class="sm:col-span-2 pt-2">
          <FhButton type="submit" variant="primary" size="md" block :loading="loading">
            <Search :size="16" />
            Tra cứu thông tin
          </FhButton>
        </div>
      </form>
    </FhCard>

    <!-- Results Display -->
    <div v-if="searched && mockFoundOrder" class="space-y-6">
      <FhCard class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
          <div>
            <span class="text-xs font-num font-bold text-ink-500">{{ mockFoundOrder.code }}</span>
            <h3 class="text-lg font-bold text-ink-900">{{ mockFoundOrder.service }}</h3>
            <p class="text-xs text-ink-500">Thợ phụ trách: {{ mockFoundOrder.technician }}</p>
          </div>
          <FhStatusPill :status="mockFoundOrder.status" />
        </div>

        <!-- Timeline -->
        <div>
          <h4 class="text-sm font-semibold text-ink-900 mb-4 uppercase tracking-wider">Tiến trình thực hiện</h4>
          <FhTimeline :steps="mockFoundOrder.steps" />
        </div>
      </FhCard>
    </div>
  </div>
</template>
