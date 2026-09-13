<script setup lang="ts">
import { ref } from 'vue';
import { DollarSign, CheckCircle2, TrendingUp, Star, Calendar } from 'lucide-vue-next';
import { FhCard, FhStatCard, FhMoney, FhTable } from '../../components';

const payouts = ref([
  {
    orderCode: 'FH-20260910-0042',
    date: '10/09/2026',
    customer: 'Trần Văn Nam',
    gross: 400000,
    platformFee: 40000,
    net: 360000,
    status: 'COMPLETED',
  },
  {
    orderCode: 'FH-20260908-0019',
    date: '08/09/2026',
    customer: 'Lê Hoàng Anh',
    gross: 250000,
    platformFee: 25000,
    net: 225000,
    status: 'COMPLETED',
  },
  {
    orderCode: 'FH-20260905-0081',
    date: '05/09/2026',
    customer: 'Phạm Thuỳ Linh',
    gross: 500000,
    platformFee: 50000,
    net: 450000,
    status: 'COMPLETED',
  },
]);
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
        <DollarSign class="text-brand-600" :size="24" />
        Thu nhập & Báo cáo Quyết toán
      </h1>
      <p class="text-xs text-ink-500 mt-1">
        Theo dõi doanh thu công thợ, khấu trừ hoa hồng nền tảng và lịch sử thanh toán (TBD-PAY-01).
      </p>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <FhStatCard
        title="Thực nhận tháng này"
        value="12.450.000 đ"
        subtext="+15% so với tháng trước"
        variant="brand"
        :icon="TrendingUp"
      />
      <FhStatCard
        title="Đơn hoàn tất"
        value="28 đơn"
        subtext="Tỷ lệ thành công 96%"
        :icon="CheckCircle2"
      />
      <FhStatCard
        title="Đánh giá trung bình"
        value="4.95 ★"
        subtext="Từ 148 khách hàng"
        :icon="Star"
      />
      <FhStatCard
        title="Hoa hồng FixHome"
        value="10%"
        subtext="Theo biểu phí quy chuẩn"
        :icon="DollarSign"
      />
    </div>

    <!-- Payout History Table -->
    <FhCard title="Lịch sử các đơn đã quyết toán">
      <FhTable
        :columns="[
          { key: 'orderCode', label: 'Mã đơn' },
          { key: 'date', label: 'Ngày thực hiện' },
          { key: 'customer', label: 'Khách hàng' },
          { key: 'gross', label: 'Tổng thu', align: 'right' },
          { key: 'platformFee', label: 'Phí nền tảng', align: 'right' },
          { key: 'net', label: 'Thực nhận', align: 'right' },
        ]"
        :rows="payouts"
      >
        <template #cell-orderCode="{ row }">
          <span class="font-mono text-xs font-bold text-ink-900">{{ row.orderCode }}</span>
        </template>

        <template #cell-date="{ row }">
          <span class="text-xs text-ink-500 flex items-center gap-1">
            <Calendar :size="13" /> {{ row.date }}
          </span>
        </template>

        <template #cell-customer="{ row }">
          <span class="text-xs font-medium text-ink-800">{{ row.customer }}</span>
        </template>

        <template #cell-gross="{ row }">
          <span class="font-num text-xs text-ink-600">
            <FhMoney :amount="row.gross" />
          </span>
        </template>

        <template #cell-platformFee="{ row }">
          <span class="font-num text-xs text-danger-600">
            -<FhMoney :amount="row.platformFee" />
          </span>
        </template>

        <template #cell-net="{ row }">
          <span class="font-num text-xs font-bold text-success-600">
            +<FhMoney :amount="row.net" />
          </span>
        </template>
      </FhTable>
    </FhCard>
  </div>
</template>
