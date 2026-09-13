<script setup lang="ts">
import { ref } from 'vue';
import { ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-vue-next';
import { FhCard, FhTable, FhButton, FhConfirmDialog } from '../../components';

interface StrikeRecord {
  id: string;
  userName: string;
  userRole: string;
  orderCode: string;
  strikeCount: number;
  suspendedUntil: string;
  isWaived: boolean;
  reason: string;
}

const strikes = ref<StrikeRecord[]>([
  {
    id: 'st-1',
    userName: 'Nguyễn Văn Nam',
    userRole: 'TECHNICIAN',
    orderCode: 'FH-20260911-0023',
    strikeCount: 2,
    suspendedUntil: '2026-09-18',
    isWaived: false,
    reason: 'Huỷ đơn khi đã đến giờ hẹn mà không báo trước 30p',
  },
  {
    id: 'st-2',
    userName: 'Khách hàng Demo Đình chỉ',
    userRole: 'CUSTOMER',
    orderCode: 'FH-20260909-0011',
    strikeCount: 3,
    suspendedUntil: '2026-09-20',
    isWaived: false,
    reason: 'Huỷ đơn liên tiếp 3 lần sau khi thợ đã di chuyển (En Route)',
  },
]);

const showWaiveModal = ref(false);
const strikeToWaive = ref<StrikeRecord | null>(null);

const openWaive = (strike: StrikeRecord) => {
  strikeToWaive.value = strike;
  showWaiveModal.value = true;
};

const confirmWaive = () => {
  if (strikeToWaive.value) {
    strikeToWaive.value.isWaived = true;
  }
  showWaiveModal.value = false;
  window.alert('Đã miễn trừ vi phạm (Waive Strike) thành công! Lệnh đình chỉ tài khoản đã được gỡ bỏ.');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <ShieldAlert class="text-danger-600" :size="24" />
          Giám sát Vi phạm & Đình chỉ Tài khoản (Strikes)
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Theo dõi các trường hợp vi phạm quy chuẩn huỷ đơn, tự động áp dụng đình chỉ (Suspension) và miễn trừ có kiểm toán.
        </p>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'user', label: 'Tài khoản vi phạm' },
          { key: 'orderCode', label: 'Đơn liên quan' },
          { key: 'strikeCount', label: 'Số lần phạt', width: '120px' },
          { key: 'reason', label: 'Lý do áp dụng' },
          { key: 'suspension', label: 'Thời hạn đình chỉ', width: '150px' },
          { key: 'actions', label: 'Thao tác', width: '140px' },
        ]"
        :rows="strikes"
      >
        <template #cell-user="{ row }">
          <div class="font-bold text-xs text-ink-900">{{ row.userName }}</div>
          <span
            class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
            :class="row.userRole === 'TECHNICIAN' ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-800'"
          >
            {{ row.userRole }}
          </span>
        </template>

        <template #cell-orderCode="{ row }">
          <span class="font-mono text-xs text-ink-700">{{ row.orderCode }}</span>
        </template>

        <template #cell-strikeCount="{ row }">
          <span class="font-num text-xs font-bold text-danger-600">
            {{ row.strikeCount }} / 3 Strikes
          </span>
        </template>

        <template #cell-reason="{ row }">
          <span class="text-xs text-ink-600 line-clamp-2">{{ row.reason }}</span>
        </template>

        <template #cell-suspension="{ row }">
          <div v-if="!row.isWaived" class="text-xs font-semibold text-danger-600 font-num">
            Tới {{ row.suspendedUntil }}
          </div>
          <span v-else class="text-xs font-semibold text-success-600 flex items-center gap-1">
            <CheckCircle2 :size="13" /> Đã gỡ bỏ
          </span>
        </template>

        <template #cell-actions="{ row }">
          <FhButton
            v-if="!row.isWaived"
            variant="secondary"
            size="sm"
            @click="openWaive(row)"
          >
            <RotateCcw :size="13" class="mr-1" /> Miễn trừ
          </FhButton>
          <span v-else class="text-xs text-ink-400 font-semibold">Đã miễn trừ</span>
        </template>
      </FhTable>
    </FhCard>

    <!-- Waive Strike Dialog -->
    <FhConfirmDialog
      :open="showWaiveModal"
      title="Miễn trừ Vi phạm (Waive Strike)"
      consequence="Hành động này sẽ xóa 1 điểm Strike và mở khóa quyền đặt lịch/nhận đơn cho tài khoản ngay lập tức."
      confirm-text="Xác nhận miễn trừ"
      cancel-text="Giữ nguyên"
      :danger="false"
      @confirm="confirmWaive"
      @cancel="showWaiveModal = false"
    />
  </div>
</template>
