<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShieldCheck, Calendar, Wrench, Clock } from 'lucide-vue-next';
import { FhButton, FhCard, FhStatusPill } from '../../components';
import { ordersApi, type WarrantyItem } from '../../api/orders.api';

const router = useRouter();

const loading = ref(true);
const warranties = ref<WarrantyItem[]>([]);

onMounted(async () => {
  try {
    const list = await ordersApi.getWarranties();
    warranties.value = list;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <ShieldCheck class="text-success-600" :size="24" />
          Bảo hành Điện tử còn hiệu lực
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Tất cả linh kiện và dịch vụ sửa chữa của FixHome đều được cấp bảo hành điện tử minh bạch.
        </p>
      </div>

      <FhButton variant="secondary" size="sm" @click="router.push('/app/orders')">
        Xem tất cả đơn
      </FhButton>
    </div>

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải danh sách bảo hành...
    </div>

    <div v-else-if="warranties.length === 0" class="text-center py-16 bg-white rounded-[var(--radius-md)] border border-ink-200">
      <ShieldCheck :size="40" class="mx-auto text-ink-300 mb-2" />
      <h3 class="text-sm font-bold text-ink-800">Chưa có gói bảo hành nào</h3>
      <p class="text-xs text-ink-500 mt-1">Các hạng mục thay thế linh kiện sẽ tự động xuất hiện tại đây sau khi hoàn tất đơn.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FhCard
        v-for="w in warranties"
        :key="w.id"
        class="flex flex-col justify-between space-y-4"
      >
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold text-ink-900">{{ w.orderCode }}</span>
            <FhStatusPill status="COMPLETED" label="CÒN HIỆU LỰC" />
          </div>

          <h3 class="font-bold text-sm text-ink-900">{{ w.serviceName }}</h3>

          <div class="p-2.5 rounded bg-ink-50 border border-ink-200 text-xs text-ink-800">
            <strong>Hạng mục bảo hành:</strong> {{ w.itemDescription }}
          </div>

          <div class="text-xs text-ink-500 space-y-1">
            <div class="flex items-center gap-1.5">
              <Calendar :size="13" /> Hiệu lực từ: {{ w.startsAt }}
            </div>
            <div class="flex items-center gap-1.5 font-semibold text-brand-700">
              <Clock :size="13" /> Hết hạn vào: {{ w.expiresAt }}
            </div>
            <div class="flex items-center gap-1.5">
              <Wrench :size="13" /> Thợ phụ trách: {{ w.technicianName }}
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-ink-100 flex items-center justify-between">
          <span class="text-[11px] text-success-600 font-semibold">100% miễn phí công thợ</span>
          <FhButton variant="secondary" size="sm" @click="router.push('/app/bookings/new')">
            Yêu cầu hỗ trợ
          </FhButton>
        </div>
      </FhCard>
    </div>
  </div>
</template>
