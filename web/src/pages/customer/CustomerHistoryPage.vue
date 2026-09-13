<script setup lang="ts">
import { ref } from 'vue';
import { History, Calendar, Wrench, Star, CheckCircle2 } from 'lucide-vue-next';
import { FhCard, FhMoney, FhCostBreakdown } from '../../components';

const historyItems = ref([
  {
    id: 'h1',
    orderCode: 'FH-20260910-0042',
    date: '10/09/2026',
    device: 'Hệ thống điện phòng khách',
    service: 'Sửa chập điện âm tường & thay Aptomat',
    technicianName: 'Trần Đình Trọng',
    technicianRating: 5,
    customerReview: 'Thợ đến đúng giờ, dò tìm điểm chập rất chuyên nghiệp và thay aptomat an toàn.',
    laborTotal: 250000,
    partsTotal: 150000,
    grandTotal: 400000,
    evidenceUrls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  },
  {
    id: 'h2',
    orderCode: 'FH-20260815-0109',
    date: '15/08/2026',
    device: 'Điều hòa Daikin Inverter 1.5 HP',
    service: 'Vệ sinh & nạp gas điều hòa R32',
    technicianName: 'Nguyễn Văn Hùng',
    technicianRating: 5,
    customerReview: 'Máy lạnh vệ sinh sạch sẽ, mát sâu ngay sau khi bơm gas.',
    laborTotal: 200000,
    partsTotal: 0,
    grandTotal: 200000,
    evidenceUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'],
  },
]);
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-ink-900 tracking-tight flex items-center gap-2">
        <History class="text-brand-600" :size="24" />
        Nhật ký Sửa chữa Ngôi nhà (D-20 Read Model)
      </h1>
      <p class="text-xs text-ink-500 mt-1">
        Hồ sơ theo dõi tình trạng sức khỏe thiết bị gia đình, lưu trữ lịch sử bảo dưỡng và linh kiện đã thay.
      </p>
    </div>

    <div class="space-y-4">
      <FhCard
        v-for="item in historyItems"
        :key="item.id"
        class="space-y-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-ink-900">{{ item.orderCode }}</span>
            <span class="text-ink-400 text-xs">•</span>
            <span class="text-xs text-ink-500 flex items-center gap-1">
              <Calendar :size="13" /> {{ item.date }}
            </span>
          </div>

          <span class="text-xs font-semibold text-success-600 flex items-center gap-1">
            <CheckCircle2 :size="14" /> Đã nghiệm thu & thanh toán
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1.5">
            <div class="text-[11px] text-ink-400 uppercase font-semibold">Thiết bị & Dịch vụ:</div>
            <div class="font-bold text-sm text-ink-900">{{ item.device }}</div>
            <div class="text-ink-600">{{ item.service }}</div>
          </div>

          <div class="space-y-1.5 sm:text-right">
            <div class="text-[11px] text-ink-400 uppercase font-semibold">Kỹ thuật viên thực hiện:</div>
            <div class="font-semibold text-ink-900 flex items-center gap-1.5 sm:justify-end">
              <Wrench :size="13" class="text-brand-600" /> {{ item.technicianName }}
            </div>
            <div class="flex items-center gap-1 sm:justify-end text-amber-500 font-bold">
              <Star v-for="i in item.technicianRating" :key="i" :size="12" class="fill-amber-400" />
            </div>
          </div>
        </div>

        <!-- Customer Review Snippet -->
        <div class="p-3 rounded bg-ink-50 border border-ink-200 text-xs text-ink-700 italic">
          "{{ item.customerReview }}"
        </div>

        <!-- Cost Breakdown -->
        <div class="pt-3 border-t border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex-1 max-w-sm">
            <FhCostBreakdown :labor-total="item.laborTotal" :parts-total="item.partsTotal" />
          </div>

          <div class="text-right">
            <span class="text-[11px] text-ink-400 block">Tổng thanh toán:</span>
            <span class="text-sm font-bold font-num text-brand-700">
              <FhMoney :amount="item.grandTotal" />
            </span>
          </div>
        </div>
      </FhCard>
    </div>
  </div>
</template>
