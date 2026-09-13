<script setup lang="ts">
import { Check } from 'lucide-vue-next';

export interface TimelineStep {
  key: string;
  label: string;
  timestamp?: string;
  actor?: string;
  note?: string;
  completed?: boolean;
  current?: boolean;
}

interface Props {
  steps: TimelineStep[];
}

defineProps<Props>();
</script>

<template>
  <div class="relative pl-6 sm:pl-8 space-y-6">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="relative group"
    >
      <!-- Connecting Line -->
      <div
        v-if="idx < steps.length - 1"
        class="absolute left-[-17px] top-6 bottom-[-24px] w-[2px]"
        :class="step.completed ? 'bg-success-600' : 'bg-ink-200'"
      />

      <!-- Step Circle Indicator -->
      <div
        class="absolute left-[-24px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all"
        :class="[
          step.completed
            ? 'bg-success-600 text-white'
            : step.current
            ? 'bg-brand-600 ring-4 ring-brand-100 text-white'
            : 'bg-ink-200 text-transparent',
        ]"
      >
        <Check v-if="step.completed" :size="10" :stroke-width="3" />
      </div>

      <!-- Step Content -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-semibold"
            :class="[
              step.current
                ? 'text-brand-700'
                : step.completed
                ? 'text-ink-900'
                : 'text-ink-400',
            ]"
          >
            {{ step.label }}
          </span>

          <span
            v-if="step.current"
            class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-50 text-brand-600 border border-brand-200"
          >
            Hiện tại
          </span>
        </div>

        <div v-if="step.timestamp || step.actor" class="text-xs text-ink-500 flex items-center gap-2">
          <span v-if="step.timestamp" class="font-num">{{ step.timestamp }}</span>
          <span v-if="step.timestamp && step.actor">•</span>
          <span v-if="step.actor" class="italic">{{ step.actor }}</span>
        </div>

        <p v-if="step.note" class="text-xs text-ink-600 bg-ink-50 p-2 rounded-[var(--radius-sm)] mt-1 border border-ink-100">
          {{ step.note }}
        </p>
      </div>
    </div>
  </div>
</template>
