<script setup lang="ts">
import { ref } from 'vue';
import { Ban, CheckCircle2 } from 'lucide-vue-next';
import { FhCard, FhTable, FhStatusPill, FhMoney, FhButton } from '../../components';

interface CancellationRecord {
  id: string;
  orderCode: string;
  actor: string;
  actorName: string;
  stateAtCancel: string;
  reason: string;
  strikeApplied: boolean;
  compensationStatus: string;
  compensationAmount: number;
}

const cancellations = ref<CancellationRecord[]>([
  {
    id: 'c-1',
    orderCode: 'FH-20260912-0089',
    actor: 'CUSTOMER',
    actorName: 'Phạm Minh Đức',
    stateAtCancel: 'EN_ROUTE',
    reason: 'Thay đổi kế hoạch đột xuất không có ở nhà',
    strikeApplied: true,
    compensationStatus: 'PENDING_REVIEW',
    compensationAmount: 50000,
  },
  {
    id: 'c-2',
    orderCode: 'FH-20260911-0023',
    actor: 'TECHNICIAN',
    actorName: 'Nguyễn Văn Nam',
    stateAtCancel: 'ASSIGNED',
    reason: 'Xe hỏng giữa đường không kịp đến đúng giờ',
    strikeApplied: true,
    compensationStatus: 'COMPENSATED',
    compensationAmount: 0,
  },
]);

const handleResolve = (item: CancellationRecord) => {
  item.compensationStatus = 'RESOLVED';
  window.alert(`Đã xử lý tranh chấp huỷ đơn "${item.orderCode}". Trạng thái bồi thường đã cập nhật.`);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Ban class="text-danger-600" :size="24" />
          Quản lý Huỷ đơn & Giải quyết Khiếu nại
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Theo dõi nguồn gốc huỷ đơn (Customer, Technician, System), tính toán phí bù trừ và áp dụng Strike theo quy định.
        </p>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'orderCode', label: 'Mã đơn huỷ' },
          { key: 'actor', label: 'Đối tượng huỷ' },
          { key: 'state', label: 'Thời điểm huỷ' },
          { key: 'reason', label: 'Lý do ghi nhận' },
          { key: 'compensation', label: 'Bồi thường thợ' },
          { key: 'actions', label: 'Xử lý', width: '130px' },
        ]"
        :rows="cancellations"
      >
        <template #cell-orderCode="{ row }">
          <span class="font-mono text-xs font-bold text-ink-900">{{ row.orderCode }}</span>
        </template>

        <template #cell-actor="{ row }">
          <div class="font-semibold text-xs text-ink-900">{{ row.actorName }}</div>
          <span
            class="text-[10px] font-bold px-1.5 py-0.5 rounded"
            :class="row.actor === 'CUSTOMER' ? 'bg-ink-100 text-ink-800' : 'bg-brand-50 text-brand-700'"
          >
            {{ row.actor }}
          </span>
        </template>

        <template #cell-state="{ row }">
          <FhStatusPill :status="row.stateAtCancel" />
        </template>

        <template #cell-reason="{ row }">
          <span class="text-xs text-ink-600 italic line-clamp-2">"{{ row.reason }}"</span>
        </template>

        <template #cell-compensation="{ row }">
          <div class="font-num text-xs font-bold text-ink-900">
            <FhMoney :amount="row.compensationAmount" />
          </div>
          <span
            class="text-[10px] font-semibold"
            :class="row.compensationStatus === 'PENDING_REVIEW' ? 'text-warning-600' : 'text-success-600'"
          >
            {{ row.compensationStatus }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <FhButton
            v-if="row.compensationStatus === 'PENDING_REVIEW'"
            variant="primary"
            size="sm"
            @click="handleResolve(row)"
          >
            <CheckCircle2 :size="13" class="mr-1" /> Duyệt bù trừ
          </FhButton>
          <span v-else class="text-xs text-ink-400 font-semibold">Đã duyệt</span>
        </template>
      </FhTable>
    </FhCard>
  </div>
</template>
