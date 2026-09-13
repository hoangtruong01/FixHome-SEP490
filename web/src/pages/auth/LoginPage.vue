<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from 'lucide-vue-next';
import { FhButton } from '../../components';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const identifier = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const demoAccounts = [
  { label: '👑 Admin', email: 'admin@fixhome.vn', role: 'ADMIN' },
  { label: '👔 SM (Quản lý)', email: 'sm.hcm@fixhome.vn', role: 'SERVICE_MANAGER' },
  { label: '🔧 Thợ sửa', email: 'tech1@fixhome.vn', role: 'TECHNICIAN' },
  { label: '👤 Khách hàng', email: 'customer1@fixhome.vn', role: 'CUSTOMER' },
  { label: '⚠️ Khách bị khoá', email: 'customer.suspended@fixhome.vn', role: 'CUSTOMER' },
];

const fillDemo = (email: string) => {
  identifier.value = email;
  password.value = 'Password123!';
  errorMessage.value = '';
};

const handleLogin = async () => {
  if (!identifier.value || !password.value) {
    errorMessage.value = 'Vui lòng điền đầy đủ email/SĐT và mật khẩu';
    return;
  }

  errorMessage.value = '';
  try {
    const user = await authStore.login({
      email: identifier.value,
      identifier: identifier.value,
      password: password.value,
    });

    // Redirect based on role or original intended route
    const redirect = (route.query.redirect as string) || '';
    if (redirect) {
      router.push(redirect);
      return;
    }

    const role = user.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SERVICE_MANAGER') {
      router.push('/console');
    } else if (role === 'TECHNICIAN') {
      router.push('/tech');
    } else {
      router.push('/app');
    }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
    errorMessage.value =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      'Email/Số điện thoại hoặc mật khẩu không chính xác';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2 text-center sm:text-left">
      <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">Đăng nhập tài khoản</h2>
      <p class="text-sm text-ink-500">
        Chào mừng bạn quay lại với FixHome. Vui lòng nhập thông tin xác thực.
      </p>
    </div>

    <!-- Error Alert Box -->
    <div
      v-if="errorMessage"
      class="p-3.5 rounded-[var(--radius-sm)] bg-danger-50 border border-danger-200 text-danger-800 text-sm flex items-start gap-2.5"
    >
      <AlertCircle :size="18" class="text-danger-600 shrink-0 mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <!-- Identifier Input -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Email hoặc Số điện thoại
        </label>
        <div class="relative">
          <input
            v-model="identifier"
            type="text"
            required
            placeholder="example@fixhome.vn hoặc 0901234567"
            class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <Mail class="absolute left-3.5 top-3 text-ink-400" :size="17" />
        </div>
      </div>

      <!-- Password Input -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700">
            Mật khẩu
          </label>
          <router-link
            to="/forgot-password"
            class="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Quên mật khẩu?
          </router-link>
        </div>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="w-full h-11 pl-10 pr-11 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <Lock class="absolute left-3.5 top-3 text-ink-400" :size="17" />
          <button
            type="button"
            class="absolute right-3.5 top-3 text-ink-400 hover:text-ink-600 p-0.5"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" :size="17" />
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <FhButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="authStore.loading"
        class="mt-2"
      >
        Đăng nhập
      </FhButton>
    </form>

    <!-- Register Link -->
    <div class="text-center text-sm text-ink-600">
      Chưa có tài khoản?
      <router-link to="/register" class="text-brand-600 hover:text-brand-700 font-semibold ml-1">
        Đăng ký tài khoản mới
      </router-link>
    </div>

    <!-- Demo Account Quick Selector (P12.3) -->
    <div class="pt-6 border-t border-ink-200 space-y-3">
      <div class="flex items-center gap-1.5 text-xs font-semibold text-ink-500 uppercase tracking-wider">
        <Sparkles :size="14" class="text-brand-600" />
        <span>Tài khoản Demo (1-Click Fill):</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="demo in demoAccounts"
          :key="demo.email"
          type="button"
          class="px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-ink-100 hover:bg-brand-50 hover:text-brand-700 border border-ink-200 hover:border-brand-200 transition-colors text-left truncate"
          @click="fillDemo(demo.email)"
        >
          {{ demo.label }}
        </button>
      </div>
    </div>
  </div>
</template>
