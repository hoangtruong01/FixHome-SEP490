<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const baseClasses =
  'inline-flex items-center justify-center font-medium transition-all duration-120 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 select-none cursor-pointer';

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-[36px] px-3 text-sm rounded-[var(--radius-sm)] gap-1.5';
    case 'lg':
      return 'h-[52px] px-6 text-base rounded-[var(--radius-md)] gap-2.5 font-semibold';
    case 'md':
    default:
      return 'h-[44px] px-4 text-sm rounded-[var(--radius-md)] gap-2';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-25 active:bg-ink-50 shadow-[var(--shadow-e1)]';
    case 'ghost':
      return 'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200';
    case 'danger':
      return 'bg-danger-600 text-white hover:bg-danger-600/90 active:bg-danger-600/80 shadow-[var(--shadow-e1)]';
    case 'primary':
    default:
      return 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-[var(--shadow-e1)]';
  }
});

const stateClasses = computed(() => {
  if (props.disabled || props.loading) {
    return 'opacity-45 pointer-events-none shadow-none cursor-not-allowed';
  }
  return '';
});

const widthClasses = computed(() => (props.block ? 'w-full' : ''));

const handleClick = (e: MouseEvent) => {
  if (props.disabled || props.loading) {
    e.preventDefault();
    return;
  }
  emit('click', e);
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[baseClasses, sizeClasses, variantClasses, stateClasses, widthClasses]"
    @click="handleClick"
  >
    <Loader2
      v-if="loading"
      class="animate-spin text-current"
      :size="size === 'sm' ? 14 : size === 'lg' ? 20 : 16"
      :stroke-width="1.75"
    />
    <slot />
  </button>
</template>
