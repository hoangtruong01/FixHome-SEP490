<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FileQuestion } from 'lucide-vue-next';
import { FhButton } from '../components';

const router = useRouter();
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
    <div class="w-20 h-20 rounded-[var(--radius-md)] bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 mb-6 shadow-[var(--shadow-e1)]">
      <FileQuestion :size="40" :stroke-width="1.75" />
    </div>

    <span class="font-num text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
      Lỗi đường dẫn 404
    </span>

    <h1 class="text-3xl font-bold text-ink-900 tracking-tight mb-3">
      Trang không tồn tại
    </h1>

    <p class="text-sm text-ink-600 leading-relaxed mb-6">
      Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển. Vui lòng kiểm tra lại URL hoặc trở về trang chủ.
    </p>

    <FhButton variant="primary" size="md" @click="router.push('/')">
      Trở về trang chủ FixHome
    </FhButton>
  </div>
</template>
