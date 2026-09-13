<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { KanbanSquare, Search, Eye } from 'lucide-vue-next';
import {
  FhCard,
  FhTable,
  FhStatusPill,
  FhCostBreakdown,
  FhMoney,
} from '../../components';
import { ordersApi, type ServiceOrderItem } from '../../api/orders.api';

const router = useRouter();

const loading = ref(true);
const orders = ref<ServiceOrderItem[]>([]);
const searchQuery = ref('');
const statusFilter = ref('ALL');

onMounted(async () => {
  try {
    const list = await ordersApi.getConsoleOrders();
    orders.value = list;
  } finally {
    loading.value = false;
  }
});

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    const matchStatus = statusFilter.value === 'ALL' || o.status === statusFilter.value;
    const matchSearch =
      !searchQuery.value ||
      o.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchStatus && matchSearch;
  });
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
          <KanbanSquare class="text-brand-600" :size="24" />
          Board Điều phối & Quản lý Đơn sửa chữa
        </h1>
        <p class="text-xs text-ink-500 mt-1">
          Giám sát toàn bộ chu trình State Machine của đơn từ tiếp nhận, ghép thợ, khảo sát đến nghiệm thu.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-ink-600">Tổng số đơn:</span>
        <span class="text-xs font-bold font-num px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200">
          {{ filteredOrders.length }} đơn
        </span>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-[var(--radius-sm)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="relative flex-1 min-w-[240px] max-w-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo mã đơn, khách hàng hoặc dịch vụ..."
          class="w-full h-9 pl-9 pr-3 text-xs bg-ink-50 border border-ink-200 rounded-[var(--radius-sm)] focus:outline-none focus:border-brand-600 focus:bg-white"
        />
        <Search :size="15" class="absolute left-3 top-2.5 text-ink-400" />
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-ink-500">Trạng thái:</span>
        <select
          v-model="statusFilter"
          class="h-9 px-3 text-xs bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-700 focus:outline-none focus:border-brand-600"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING_MATCHING">Đang ghép thợ (PENDING_MATCHING)</option>
          <option value="ASSIGNED">Đã gán thợ (ASSIGNED)</option>
          <option value="IN_PROGRESS">Đang sửa chữa (IN_PROGRESS)</option>
          <option value="COMPLETED">Hoàn tất (COMPLETED)</option>
          <option value="CANCELLED">Đã huỷ (CANCELLED)</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <FhCard>
      <FhTable
        :columns="[
          { key: 'code', label: 'Mã đơn' },
          { key: 'service', label: 'Dịch vụ & Địa chỉ' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'technician', label: 'Thợ phụ trách' },
          { key: 'costs', label: 'Phân tách Công / Phụ tùng' },
          { key: 'status', label: 'Trạng thái', width: '130px' },
          { key: 'actions', label: 'Chi tiết', width: '90px' },
        ]"
        :rows="filteredOrders"
      >
        <template #cell-code="{ row }">
          <span class="font-mono text-xs font-bold text-ink-900">{{ row.code }}</span>
          <div class="text-[10px] text-ink-400 font-num">{{ new Date(row.createdAt).toLocaleDateString('vi-VN') }}</div>
        </template>

        <template #cell-service="{ row }">
          <div class="font-semibold text-xs text-ink-900">{{ row.serviceName }}</div>
          <div class="text-[11px] text-ink-400 line-clamp-1">{{ row.addressSummary }}</div>
        </template>

        <template #cell-customer="{ row }">
          <div class="text-xs font-medium text-ink-900">{{ row.customerName }}</div>
          <div class="text-[10px] text-ink-500 font-mono">{{ row.customerPhone }}</div>
        </template>

        <template #cell-technician="{ row }">
          <div v-if="row.technician" class="text-xs font-medium text-ink-900">
            {{ row.technician.fullName }}
            <span class="text-[10px] text-amber-600 block">★ {{ row.technician.averageRating }}</span>
          </div>
          <span v-else class="text-[11px] text-amber-600 font-semibold">Chưa gán thợ</span>
        </template>

        <template #cell-costs="{ row }">
          <div class="w-48">
            <FhCostBreakdown :labor-total="row.laborTotal" :parts-total="row.partsTotal" />
            <div class="text-right text-[11px] font-bold text-brand-700 font-num mt-1">
              <FhMoney :amount="row.grandTotal" />
            </div>
          </div>
        </template>

        <template #cell-status="{ row }">
          <FhStatusPill :status="row.status" />
        </template>

        <template #cell-actions="{ row }">
          <button
            class="p-1.5 text-ink-500 hover:text-brand-600 rounded hover:bg-ink-100 transition-colors"
            title="Xem chi tiết"
            @click="router.push(`/console/orders/${row.id}`)"
          >
            <Eye :size="16" />
          </button>
        </template>
      </FhTable>
    </FhCard>
  </div>
</template>
