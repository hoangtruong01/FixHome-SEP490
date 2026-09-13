<script setup lang="ts">
import { computed } from 'vue';
import FhMoney from './FhMoney.vue';

interface Props {
  laborTotal: number | string;
  partsTotal: number | string;
  grandTotal?: number | string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const laborNum = computed(() => {
  const n = typeof props.laborTotal === 'string' ? parseFloat(props.laborTotal) : Number(props.laborTotal || 0);
  return isNaN(n) ? 0 : n;
});

const partsNum = computed(() => {
  const n = typeof props.partsTotal === 'string' ? parseFloat(props.partsTotal) : Number(props.partsTotal || 0);
  return isNaN(n) ? 0 : n;
});

const totalNum = computed(() => {
  if (props.grandTotal !== undefined) {
    const g = typeof props.grandTotal === 'string' ? parseFloat(props.grandTotal) : Number(props.grandTotal);
    if (!isNaN(g)) return g;
  }
  return laborNum.value + partsNum.value;
});

const laborPct = computed(() => {
  const sum = laborNum.value + partsNum.value;
  if (sum <= 0) return 50;
  return Math.max(5, Math.min(95, Math.round((laborNum.value / sum) * 100)));
});

const partsPct = computed(() => 100 - laborPct.value);
</script>

<template>
  <div class="w-full space-y-3 p-4 bg-ink-25 rounded-[var(--radius-md)] border border-ink-200">
    <!-- Breakdown Rows -->
    <div class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-2 text-ink-700">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-400 shrink-0" />
          <span>Tiền công thợ (Labor)</span>
        </span>
        <FhMoney :amount="laborNum" />
      </div>

      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-2 text-ink-700">
          <span class="w-2.5 h-2.5 rounded-full bg-info-600 shrink-0" />
          <span>Thiết bị & vật tư (Parts)</span>
        </span>
        <FhMoney :amount="partsNum" />
      </div>
    </div>

    <!-- Segmented Ratio Bar (D-02 UI visual) -->
    <div
      v-if="!compact"
      class="h-2 w-full rounded-full bg-ink-200 overflow-hidden flex"
      title="Tỷ lệ Chi phí: Công / Vật tư"
    >
      <div
        class="bg-brand-400 transition-all duration-300"
        :style="{ width: `${laborPct}%` }"
      />
      <div
        class="bg-info-600 transition-all duration-300"
        :style="{ width: `${partsPct}%` }"
      />
    </div>

    <!-- Grand Total Row -->
    <div class="pt-2 border-t border-ink-200 flex items-center justify-between">
      <span class="font-semibold text-ink-900">Tổng thanh toán:</span>
      <FhMoney :amount="totalNum" emphasis />
    </div>
  </div>
</template>
