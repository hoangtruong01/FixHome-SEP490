<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next';
import FhButton from './FhButton.vue';

interface Props {
  open: boolean;
  title: string;
  consequence: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Xác nhận',
  cancelText: 'Quay lại',
  danger: true,
  loading: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs transition-opacity"
    >
      <div
        class="bg-white rounded-[var(--radius-lg)] border border-ink-200 shadow-[var(--shadow-e3)] max-w-md w-full overflow-hidden p-6 space-y-4"
      >
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
              :class="danger ? 'bg-danger-50 text-danger-600' : 'bg-warning-50 text-warning-600'"
            >
              <AlertTriangle :size="22" :stroke-width="1.75" />
            </div>
            <h3 class="text-h2 font-semibold text-ink-900">
              {{ title }}
            </h3>
          </div>
          <button
            class="text-ink-400 hover:text-ink-700 p-1 rounded transition-colors"
            @click="emit('cancel')"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Consequence Box (Mandated by P7.7) -->
        <div
          class="p-3.5 rounded-[var(--radius-sm)] text-sm border"
          :class="danger ? 'bg-danger-50/70 border-danger-200 text-danger-900' : 'bg-warning-50/70 border-warning-200 text-warning-900'"
        >
          <p class="font-medium">
            {{ consequence }}
          </p>
        </div>

        <slot />

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <FhButton
            variant="secondary"
            size="md"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </FhButton>
          <FhButton
            :variant="danger ? 'danger' : 'primary'"
            size="md"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </FhButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
