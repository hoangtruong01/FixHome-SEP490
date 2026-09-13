<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ShieldX } from 'lucide-vue-next';
import { FhButton } from '../components';

const router = useRouter();
const authStore = useAuthStore();

const goBack = () => {
  const role = authStore.userRole;
  if (role === 'ADMIN' || role === 'SERVICE_MANAGER') {
    router.push('/console');
  } else if (role === 'TECHNICIAN') {
    router.push('/tech');
  } else if (role === 'CUSTOMER') {
    router.push('/app');
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
    <!-- 403 Icon Tile -->
    <div class="w-20 h-20 rounded-[var(--radius-md)] bg-danger-50 text-danger-600 flex items-center justify-center border border-danger-200 mb-6 shadow-[var(--shadow-e1)]">
      <ShieldX :size="40" :stroke-width="1.75" />
    </div>

    <span class="font-num text-xs font-bold uppercase tracking-widest text-danger-600 mb-2">
      Lỗi truy cập 403
    </span>

    <h1 class="text-3xl font-bold text-ink-900 tracking-tight mb-3">
      Không có quyền truy cập
    </h1>

    <p class="text-sm text-ink-600 leading-relaxed mb-6">
      Tài khoản của bạn với vai trò
      <span class="font-semibold text-ink-900 uppercase">[{{ authStore.user?.role ?? 'Khách' }}]</span>
      không có quyền hạn để xem trang hoặc thực hiện hành động này.
    </p>

    <div class="flex items-center gap-3">
      <FhButton variant="primary" size="md" @click="goBack">
        Về trang quản lý của bạn
      </FhButton>
      <FhButton variant="secondary" size="md" @click="router.push('/')">
        Trang chủ
      </FhButton>
    </div>
  </div>
</template>
