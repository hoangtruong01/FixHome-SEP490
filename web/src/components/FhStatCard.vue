<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next';

interface Props {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  sparklineData?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  delta: 0,
  deltaLabel: 'so với kỳ trước',
  sparklineData: () => [12, 18, 14, 22, 28, 25, 32],
});

const isPositive = computed(() => props.delta >= 0);

// SVG sparkline coordinates generator
const sparklinePoints = computed(() => {
  const data = props.sparklineData;
  if (!data || data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 18;

  return data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});
</script>

<template>
  <div class="p-5 bg-white rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)] flex flex-col justify-between">
    <!-- Header: Overline title -->
    <div class="text-overline text-ink-500 font-semibold tracking-wider uppercase">
      {{ title }}
    </div>

    <!-- Metric Value -->
    <div class="my-2 font-num text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
      {{ value }}
    </div>

    <!-- Bottom: Delta + Sparkline (All 3 parts required per P7.7) -->
    <div class="flex items-center justify-between pt-2 border-t border-ink-100">
      <div class="flex items-center gap-1 text-xs font-medium" :class="isPositive ? 'text-success-600' : 'text-danger-600'">
        <component
          :is="isPositive ? ArrowUpRight : ArrowDownRight"
          :size="14"
          :stroke-width="2"
        />
        <span>{{ isPositive ? `+${delta}%` : `${delta}%` }}</span>
        <span class="text-ink-400 font-normal ml-0.5">{{ deltaLabel }}</span>
      </div>

      <!-- Sparkline 48x18 SVG -->
      <svg
        class="w-12 h-[18px] shrink-0"
        viewBox="0 0 48 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          fill="none"
          :stroke="isPositive ? 'var(--color-success-600)' : 'var(--color-danger-600)'"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="sparklinePoints"
        />
      </svg>
    </div>
  </div>
</template>
