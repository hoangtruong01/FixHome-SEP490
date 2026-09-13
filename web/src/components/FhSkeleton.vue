<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  rounded: 'sm',
  count: 1,
});

const radiusClass = computed(() => {
  switch (props.rounded) {
    case 'md':
      return 'rounded-[var(--radius-md)]';
    case 'lg':
      return 'rounded-[var(--radius-lg)]';
    case 'full':
      return 'rounded-full';
    case 'sm':
    default:
      return 'rounded-[var(--radius-sm)]';
  }
});
</script>

<template>
  <div class="space-y-2 w-full">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse bg-ink-200/70"
      :class="radiusClass"
      :style="{ width, height }"
    />
  </div>
</template>
