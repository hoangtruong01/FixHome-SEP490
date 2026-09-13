<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  clickable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  padding: 'md',
  as: 'div',
});

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3 sm:p-4';
    case 'lg':
      return 'p-6 sm:p-8';
    case 'md':
    default:
      return 'p-5 sm:p-6';
  }
});
</script>

<template>
  <component
    :is="as"
    class="bg-white rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e1)] transition-all duration-120 overflow-hidden"
    :class="[
      paddingClasses,
      {
        'hover:shadow-[var(--shadow-e2)] hover:-translate-y-[1px] cursor-pointer': clickable,
      },
    ]"
  >
    <slot />
  </component>
</template>
