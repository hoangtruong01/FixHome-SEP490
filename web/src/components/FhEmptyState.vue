<script setup lang="ts">
import type { Component } from 'vue';
import { Inbox } from 'lucide-vue-next';
import FhButton from './FhButton.vue';

interface Props {
  title: string;
  description: string;
  actionText?: string;
  icon?: Component;
}

withDefaults(defineProps<Props>(), {
  actionText: '',
  icon: () => Inbox,
});

const emit = defineEmits<{
  (e: 'action'): void;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto">
    <!-- 40px Icon in brand-50 tile per P7.7 -->
    <div class="w-16 h-16 rounded-[var(--radius-sm)] bg-brand-50 flex items-center justify-center text-brand-600 mb-4 border border-brand-100">
      <component :is="icon" :size="32" :stroke-width="1.75" />
    </div>

    <!-- Title -->
    <h3 class="text-h2 text-ink-900 font-semibold mb-1">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-ink-600 mb-6 leading-relaxed">
      {{ description }}
    </p>

    <!-- CTA Button -->
    <FhButton
      v-if="actionText"
      variant="primary"
      size="md"
      @click="emit('action')"
    >
      {{ actionText }}
    </FhButton>
    <slot name="extra" />
  </div>
</template>
