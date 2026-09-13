<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: string;
  label?: string;
  pulse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  pulse: false,
});

const statusConfig = computed(() => {
  const s = props.status.toUpperCase();
  switch (s) {
    case 'PENDING_CONFIRMATION':
      return {
        bg: 'bg-info-50',
        text: 'text-info-600',
        dot: 'bg-info-600',
        defaultLabel: 'Chờ xác nhận',
      };
    case 'ACCEPTED':
      return {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        dot: 'bg-violet-600',
        defaultLabel: 'Đã nhận đơn',
      };
    case 'EN_ROUTE':
      return {
        bg: 'bg-warning-50',
        text: 'text-warning-600',
        dot: 'bg-warning-600',
        defaultLabel: 'Đang di chuyển',
      };
    case 'UNDER_REPAIR':
      return {
        bg: 'bg-brand-50',
        text: 'text-brand-700',
        dot: 'bg-brand-600',
        defaultLabel: 'Đang sửa chữa',
      };
    case 'COMPLETED':
      return {
        bg: 'bg-success-50',
        text: 'text-success-600',
        dot: 'bg-success-600',
        defaultLabel: 'Hoàn thành',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-ink-100',
        text: 'text-ink-600',
        dot: 'bg-ink-400',
        defaultLabel: 'Đã huỷ',
      };
    case 'PENDING_APPROVAL':
      return {
        bg: 'bg-warning-50',
        text: 'text-warning-600',
        dot: 'bg-warning-600 animate-pulse',
        defaultLabel: 'Chờ duyệt',
      };
    case 'SUSPENDED':
    case 'LOCKED':
      return {
        bg: 'bg-danger-50',
        text: 'text-danger-600',
        dot: 'bg-danger-600',
        defaultLabel: 'Đang bị khoá',
      };
    case 'ACTIVE':
    case 'APPROVED':
    case 'PAID':
      return {
        bg: 'bg-success-50',
        text: 'text-success-600',
        dot: 'bg-success-600',
        defaultLabel: s === 'PAID' ? 'Đã thanh toán' : 'Hoạt động',
      };
    case 'PENDING':
    case 'UNPAID':
      return {
        bg: 'bg-warning-50',
        text: 'text-warning-600',
        dot: 'bg-warning-600',
        defaultLabel: s === 'UNPAID' ? 'Chưa thanh toán' : 'Đang chờ',
      };
    default:
      return {
        bg: 'bg-ink-100',
        text: 'text-ink-700',
        dot: 'bg-ink-500',
        defaultLabel: props.status,
      };
  }
});

const displayLabel = computed(() => props.label || statusConfig.value.defaultLabel);
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 h-[24px] px-2 rounded-[var(--radius-sm)] text-[12px] font-medium select-none"
    :class="[statusConfig.bg, statusConfig.text]"
  >
    <span
      class="w-[6px] h-[6px] rounded-full shrink-0"
      :class="[statusConfig.dot, { 'animate-pulse': pulse || status === 'PENDING_APPROVAL' }]"
    />
    <span class="leading-none">{{ displayLabel }}</span>
  </span>
</template>
