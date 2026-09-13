<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  amount: number | string | null | undefined;
  emphasis?: boolean;
  showSign?: boolean;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  emphasis: false,
  showSign: false,
  currency: '₫',
});

const formattedAmount = computed(() => {
  const num = typeof props.amount === 'string' ? parseFloat(props.amount) : Number(props.amount ?? 0);
  if (isNaN(num)) return '0';

  // Format with dots as thousands separator (Vietnamese currency convention: 1.250.000)
  const absFormatted = Math.abs(Math.round(num)).toLocaleString('vi-VN');

  if (props.showSign && num > 0) {
    return `+${absFormatted}`;
  } else if (num < 0) {
    return `-${absFormatted}`;
  }
  return absFormatted;
});
</script>

<template>
  <span
    class="inline-flex items-baseline gap-1 font-num tabular-nums select-none"
    :class="[
      emphasis
        ? 'text-lg sm:text-xl font-bold text-ink-900 tracking-tight'
        : 'text-sm sm:text-base font-semibold text-ink-900',
    ]"
  >
    <span>{{ formattedAmount }}</span>
    <span class="text-[0.85em] font-normal text-ink-600">{{ currency }}</span>
  </span>
</template>
