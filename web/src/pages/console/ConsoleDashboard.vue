<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  KanbanSquare,
  UserCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-vue-next';
import {
  FhButton,
  FhStatCard,
  FhStatusPill,
  FhTable,
  type TableColumn,
} from '../../components';

const router = useRouter();

const columns: TableColumn[] = [
  { key: 'code', label: 'Mã đơn', width: '130px' },
  { key: 'customer', label: 'Khách hàng' },
  { key: 'technician', label: 'Kỹ thuật viên' },
  { key: 'service', label: 'Dịch vụ' },
  { key: 'status', label: 'Trạng thái', width: '150px' },
  { key: 'action', label: 'Thao tác', align: 'right', width: '100px' },
];

const pendingOrders = [
  {
    id: 'ord-01',
    code: 'FH-20260913-0001',
    customer: 'Nguyễn Văn An (Q.1)',
    technician: 'Trần Văn Hoàng',
    service: 'Vệ sinh máy lạnh Daikin',
    status: 'UNDER_REPAIR',
  },
  {
    id: 'ord-03',
    code: 'FH-20260913-0003',
    customer: 'Lê Thị Mai (Q.3)',
    technician: 'Chưa chỉ định',
    service: 'Sửa rò rỉ đường ống nước',
    status: 'PENDING_CONFIRMATION',
  },
  {
    id: 'ord-04',
    code: 'FH-20260913-0004',
    customer: 'Phạm Đức (Bình Thạnh)',
    technician: 'Vũ Quốc Huy',
    service: 'Thay ổ cắm điện âm tường',
    status: 'EN_ROUTE',
  },
];
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)]">
      <div>
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">
          Bảng điều khiển vận hành FixHome
        </h1>
        <p class="text-sm text-ink-500">
          Giám sát trạng thái 6 state đơn hàng, điều phối thợ và xử lý vi phạm trong ngày.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <FhButton variant="secondary" size="md" @click="router.push('/console/matching')">
          <UserCheck :size="16" />
          Điều phối thợ
        </FhButton>
        <FhButton variant="primary" size="md" @click="router.push('/console/orders')">
          <KanbanSquare :size="16" />
          Xem Kanban Board
        </FhButton>
      </div>
    </div>

    <!-- 4 Stats Cards per P7.7 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <FhStatCard
        title="Đơn đang hoạt động"
        value="18"
        :delta="12"
        delta-label="so với tuần trước"
        :sparkline-data="[8, 12, 10, 15, 14, 16, 18]"
      />
      <FhStatCard
        title="Booking chờ ghép thợ"
        value="4"
        :delta="-25"
        delta-label="thời gian chờ < 8p"
        :sparkline-data="[8, 6, 7, 5, 4, 3, 4]"
      />
      <FhStatCard
        title="Khiếu nại & Huỷ vi phạm"
        value="2"
        :delta="-50"
        delta-label="cần SM giải quyết"
        :sparkline-data="[5, 4, 3, 2, 2, 1, 2]"
      />
      <FhStatCard
        title="Tỷ lệ thợ check-in hợp lệ"
        value="98.5%"
        :delta="1.2"
        delta-label="bán kính ≤ 300m"
        :sparkline-data="[95, 96, 96.5, 97, 98, 98.2, 98.5]"
      />
    </div>

    <!-- Alert / Escalation Notice -->
    <div class="p-4 rounded-[var(--radius-md)] bg-warning-50 border border-warning-200 flex items-start gap-3">
      <AlertTriangle :size="20" class="text-warning-600 shrink-0 mt-0.5" />
      <div class="space-y-0.5 text-xs text-warning-900">
        <p class="font-bold">Cảnh báo vận hành khu vực:</p>
        <p>Có 1 đơn hàng #FH-20260913-0003 tại Quận 3 chưa có thợ nhận sau 10 phút. Hệ thống đề xuất Service Manager can thiệp điều phối thủ công.</p>
      </div>
      <FhButton variant="secondary" size="sm" class="ml-auto shrink-0 bg-white" @click="router.push('/console/matching')">
        Can thiệp ngay
      </FhButton>
    </div>

    <!-- Active Orders Management Table -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-ink-900">Đơn hàng cần giám sát</h2>
        <router-link to="/console/orders" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          Mở toàn bộ danh sách <ArrowRight :size="14" />
        </router-link>
      </div>

      <FhTable :columns="columns" :rows="pendingOrders">
        <template #cell(code)="{ value }">
          <span class="font-num font-bold text-ink-800">{{ value }}</span>
        </template>
        <template #cell(status)="{ value }">
          <FhStatusPill :status="String(value)" />
        </template>
        <template #cell(action)="{ row }">
          <FhButton variant="ghost" size="sm" @click="router.push(`/console/orders/${String(row.id)}`)">
            Chi tiết
          </FhButton>
        </template>
      </FhTable>
    </div>
  </div>
</template>
