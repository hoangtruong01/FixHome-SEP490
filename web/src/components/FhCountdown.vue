<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Clock } from 'lucide-vue-next';

interface Props {
  expiresAt: string | Date | number;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Thời gian còn lại:',
});

const remainingSeconds = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const updateRemaining = () => {
  const target = new Date(props.expiresAt).getTime();
  const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
  remainingSeconds.value = diff;
};

onMounted(() => {
  updateRemaining();
  timer = setInterval(updateRemaining, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const isUrgent = computed(() => remainingSeconds.value > 0 && remainingSeconds.value < 300); // under 5 minutes
const isExpired = computed(() => remainingSeconds.value <= 0);

const formattedTime = computed(() => {
  if (isExpired.value) return 'Đã hết hạn';
  const mins = Math.floor(remainingSeconds.value / 60);
  const secs = remainingSeconds.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium font-num select-none"
    :class="[
      isExpired
        ? 'bg-ink-100 text-ink-500'
        : isUrgent
        ? 'bg-danger-50 text-danger-600 animate-pulse font-bold'
        : 'bg-warning-50 text-warning-600',
    ]"
  >
    <Clock :size="14" :stroke-width="2" />
    <span v-if="label" class="font-normal">{{ label }}</span>
    <span>{{ formattedTime }}</span>
  </span>
</template>
