<script setup lang="ts">
import { ref } from 'vue';
import { Ban, Zap, ShieldAlert } from 'lucide-vue-next';
import { FhCard, FhTable, FhStatusPill, FhButton } from '../../components';

interface CancellationRecord {
  id: string;
  orderCode: string;
  actor: string;
  actorName: string;
  stateAtCancel: string;
  reason: string;
  strikeApplied: boolean;
  priorityBoostGranted: boolean;
  status: string;
}

const cancellations = ref<CancellationRecord[]>([
  {
    id: 'c-1',
    orderCode: 'FH-20260912-0089',
    actor: 'CUSTOMER',
    actorName: 'Phạm Minh Đức',
    stateAtCancel: 'EN_ROUTE',
    reason: 'Thay đổi kế hoạch đột xuất không có ở nhà sau khi thợ đã đến khu vực',
    strikeApplied: true,
    priorityBoostGranted: false,
    status: 'PENDING_REVIEW',
  },
  {
    id: 'c-2',
    orderCode: 'FH-20260911-0023',
    actor: 'TECHNICIAN',
    actorName: 'Nguyễn Văn Nam',
    stateAtCancel: 'ACCEPTED',
    reason: 'Xe hỏng giữa đường không kịp đến đúng giờ hẹn',
    strikeApplied: true,
    priorityBoostGranted: false,
    status: 'RESOLVED',
  },
]);

const handleGrantBoost = (item: CancellationRecord) => {
  item.priorityBoostGranted = true;
  item.status = 'RESOLVED';
  window.alert(`Đã xử lý huỷ đơn "${item.orderCode}": Áp dụng 1 Strike cho khách hàng và cấp Priority Boost 7 ngày cho thợ (Spec v1.2 D-19).`);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <Ban class="text-danger-600" :size="24" />
          Quản lý Huỷ đơn, Strike & Priority Boost
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Theo dõi nguồn gốc huỷ đơn (Customer / Technician), ghi nhận Strike vi phạm và cấp Priority Boost cho thợ khi khách huỷ sau arrival (Spec v1.2 BRX-034 - Không bồi thường tiền mặt).
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
          { key: 'remedy', label: 'Biện pháp chế tài' },
          { key: 'actions', label: 'Xử lý', width: '160px' },
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

        <template #cell-remedy="{ row }">
          <div class="space-y-1">
            <div v-if="row.strikeApplied" class="flex items-center gap-1 text-[11px] font-semibold text-danger-600">
              <ShieldAlert :size="12" /> +1 Strike vi phạm
            </div>
            <div v-if="row.priorityBoostGranted" class="flex items-center gap-1 text-[11px] font-bold text-brand-600">
              <Zap :size="12" /> Priority Boost thợ
            </div>
            <span v-if="!row.priorityBoostGranted && row.status === 'PENDING_REVIEW'" class="text-[10px] text-warning-600 font-semibold">
              Chờ SM duyệt Boost
            </span>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <FhButton
            v-if="row.status === 'PENDING_REVIEW'"
            variant="primary"
            size="sm"
            @click="handleGrantBoost(row)"
          >
            <Zap :size="13" class="mr-1" /> Cấp Priority Boost
          </FhButton>
          <span v-else class="text-xs text-ink-400 font-semibold">Đã duyệt xử lý</span>
        </template>
      </FhTable>
    </FhCard>
  </div>
</template>
