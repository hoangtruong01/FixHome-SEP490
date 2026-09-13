<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
import { FhButton } from '../../components';

const router = useRouter();
const authStore = useAuthStore();

const fullName = ref('');
const email = ref('');
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  if (!fullName.value || !email.value || !password.value) {
    errorMessage.value = 'Vui lòng điền đầy đủ các trường bắt buộc';
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 8 ký tự';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp';
    return;
  }

  errorMessage.value = '';
  try {
    await authStore.register({
      fullName: fullName.value,
      email: email.value,
      phoneNumber: phoneNumber.value || undefined,
      password: password.value,
    });
    router.push('/app');
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
    errorMessage.value =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      'Đăng ký tài khoản thất bại. Email hoặc Số điện thoại có thể đã tồn tại.';
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2 text-center sm:text-left">
      <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">Tạo tài khoản khách hàng</h2>
      <p class="text-sm text-ink-500">
        Đặt lịch sửa chữa nhà cửa nhanh chóng và quản lý bảo hành dễ dàng.
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

    <form class="space-y-4" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Họ và tên <span class="text-danger-600">*</span>
        </label>
        <div class="relative">
          <input
            v-model="fullName"
            type="text"
            required
            placeholder="Nguyễn Văn A"
            class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <User class="absolute left-3.5 top-3 text-ink-400" :size="17" />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Email <span class="text-danger-600">*</span>
        </label>
        <div class="relative">
          <input
            v-model="email"
            type="email"
            required
            placeholder="customer@example.com"
            class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <Mail class="absolute left-3.5 top-3 text-ink-400" :size="17" />
        </div>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Số điện thoại
        </label>
        <div class="relative">
          <input
            v-model="phoneNumber"
            type="tel"
            placeholder="0912345678"
            class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <Phone class="absolute left-3.5 top-3 text-ink-400" :size="17" />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Mật khẩu (≥ 8 ký tự) <span class="text-danger-600">*</span>
        </label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
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

      <!-- Confirm Password -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1.5">
          Xác nhận mật khẩu <span class="text-danger-600">*</span>
        </label>
        <div class="relative">
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="w-full h-11 pl-10 pr-4 text-sm bg-white border border-ink-200 rounded-[var(--radius-sm)] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <Lock class="absolute left-3.5 top-3 text-ink-400" :size="17" />
        </div>
      </div>

      <FhButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="authStore.loading"
        class="mt-4"
      >
        Đăng ký tài khoản
      </FhButton>
    </form>

    <div class="text-center text-sm text-ink-600">
      Đã có tài khoản?
      <router-link to="/login" class="text-brand-600 hover:text-brand-700 font-semibold ml-1">
        Đăng nhập
      </router-link>
    </div>
  </div>
</template>
