<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Wrench, MapPin, Calendar, User, ChevronRight } from 'lucide-vue-next';
import { FhButton, FhCard, FhStatusPill, FhCostBreakdown, FhMoney } from '../../components';
import { ordersApi, type ServiceOrderItem } from '../../api/orders.api';

const router = useRouter();

const loading = ref(true);
const jobs = ref<ServiceOrderItem[]>([]);

onMounted(async () => {
  try {
    const list = await ordersApi.getTechnicianJobs();
    jobs.value = list;
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
          <Wrench class="text-brand-600" :size="24" />
          Đơn Được Giao & Workspace Thực thi
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Quản lý các đơn sửa chữa bạn đang phụ trách: check-in GPS, lập báo giá và hoàn tất nghiệm thu.
        </p>
      </div>

      <FhButton variant="secondary" size="sm" @click="router.push('/tech/invitations')">
        Hộp thư mời
      </FhButton>
    </div>

    <div v-if="loading" class="text-center py-16 text-ink-400">
      Đang tải danh sách công việc...
    </div>

    <div v-else-if="jobs.length === 0" class="text-center py-16 bg-white rounded-[var(--radius-md)] border border-ink-200 space-y-2">
      <Wrench :size="40" class="mx-auto text-ink-300" />
      <h3 class="text-sm font-bold text-ink-800">Không có việc nào cần làm hiện tại</h3>
      <p class="text-xs text-ink-500">Hãy bật sẵn sàng nhận việc để nhận thêm lời mời mới.</p>
    </div>

    <div v-else class="space-y-4">
      <FhCard
        v-for="job in jobs"
        :key="job.id"
        class="cursor-pointer hover:border-brand-300 transition-colors"
        @click="router.push(`/tech/jobs/${job.id}`)"
      >
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-ink-900">{{ job.code }}</span>
              <span class="text-ink-400 text-xs">•</span>
              <span class="text-xs text-ink-500 flex items-center gap-1">
                <Calendar :size="13" /> {{ new Date(job.scheduledAt).toLocaleDateString('vi-VN') }}
              </span>
            </div>

            <FhStatusPill :status="job.status" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <h3 class="font-bold text-sm text-ink-900">{{ job.serviceName }}</h3>
              <p class="text-xs text-ink-600 flex items-center gap-1">
                <MapPin :size="13" class="text-brand-600 shrink-0" />
                {{ job.addressSummary }}
              </p>
            </div>

            <div class="space-y-1 sm:text-right">
              <div class="text-xs font-semibold text-ink-900 flex items-center gap-1 sm:justify-end">
                <User :size="13" class="text-ink-400" /> Khách hàng: {{ job.customerName }}
              </div>
              <div class="text-xs font-mono text-ink-500">{{ job.customerPhone }}</div>
            </div>
          </div>

          <!-- Cost Bar & Enter Workspace CTA -->
          <div class="pt-3 border-t border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1 max-w-sm">
              <FhCostBreakdown :labor-total="job.laborTotal" :parts-total="job.partsTotal" />
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div class="text-right">
                <span class="text-[11px] text-ink-400 block">Dự kiến thu:</span>
                <span class="text-sm font-bold font-num text-brand-700">
                  <FhMoney :amount="job.grandTotal" />
                </span>
              </div>

              <FhButton variant="primary" size="sm">
                Vào Workspace <ChevronRight :size="14" class="ml-1" />
              </FhButton>
            </div>
          </div>
        </div>
      </FhCard>
    </div>
  </div>
</template>
