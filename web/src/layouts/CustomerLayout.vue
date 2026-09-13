<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Wrench,
  CalendarPlus,
  ShieldAlert,
  MapPin,
  Bell,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-vue-next';
import { FhButton } from '../components';

const router = useRouter();
const authStore = useAuthStore();
const avatarMenuOpen = ref(false);

const isSuspended = computed<boolean>(() => {
  if (authStore.user?.status === 'SUSPENDED') return true;
  if (authStore.user?.bookingSuspendedUntil) {
    return new Date(authStore.user.bookingSuspendedUntil) > new Date();
  }
  return false;
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ink-50 text-ink-900">
    <!-- Top Navigation Bar per P6.1 -->
    <header class="sticky top-0 z-30 bg-white border-b border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="max-w-[1120px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Brand / Logo -->
        <div class="flex items-center gap-8">
          <router-link to="/app" class="inline-flex items-center gap-2">
            <div class="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white">
              <Wrench :size="20" :stroke-width="2" />
            </div>
            <span class="text-xl font-bold text-ink-900 tracking-tight">Fix<span class="text-brand-600">Home</span></span>
          </router-link>

          <!-- Nav Items -->
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700">
            <router-link
              to="/app"
              class="hover:text-brand-600 transition-colors py-1"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              Tổng quan
            </router-link>
            <router-link
              to="/app/orders"
              class="hover:text-brand-600 transition-colors py-1"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              Đơn sửa chữa
            </router-link>
            <router-link
              to="/app/warranties"
              class="hover:text-brand-600 transition-colors py-1"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              Bảo hành
            </router-link>
            <router-link
              to="/app/history"
              class="hover:text-brand-600 transition-colors py-1"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              Lịch sử sửa chữa
            </router-link>
          </nav>
        </div>

        <!-- Right Side: Booking CTA + Avatar Menu -->
        <div class="flex items-center gap-4">
          <!-- Create Booking Button -->
          <FhButton
            variant="primary"
            size="sm"
            :disabled="isSuspended"
            :title="isSuspended ? 'Tài khoản đang bị tạm khoá đặt dịch vụ' : 'Tạo yêu cầu sửa chữa mới'"
            @click="router.push('/app/bookings/new')"
          >
            <CalendarPlus :size="16" />
            <span class="hidden sm:inline">Đặt thợ ngay</span>
          </FhButton>

          <!-- User Avatar Dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-2 p-1.5 rounded-[var(--radius-sm)] hover:bg-ink-100 transition-colors"
              @click="avatarMenuOpen = !avatarMenuOpen"
            >
              <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm border border-brand-200">
                {{ authStore.user?.fullName?.charAt(0) ?? 'C' }}
              </div>
              <ChevronDown :size="16" class="text-ink-500" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="avatarMenuOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e3)] py-2 z-50 divide-y divide-ink-100"
              @click="avatarMenuOpen = false"
            >
              <div class="px-4 py-2">
                <p class="text-sm font-semibold text-ink-900 truncate">{{ authStore.user?.fullName }}</p>
                <p class="text-xs text-ink-500 truncate">{{ authStore.user?.email }}</p>
              </div>

              <div class="py-1 text-sm text-ink-700">
                <router-link to="/app/profile" class="flex items-center gap-2.5 px-4 py-2 hover:bg-ink-50">
                  <User :size="16" />
                  Hồ sơ cá nhân
                </router-link>
                <router-link to="/app/addresses" class="flex items-center gap-2.5 px-4 py-2 hover:bg-ink-50">
                  <MapPin :size="16" />
                  Sổ địa chỉ
                </router-link>
                <router-link to="/app/notifications" class="flex items-center gap-2.5 px-4 py-2 hover:bg-ink-50">
                  <Bell :size="16" />
                  Thông báo
                </router-link>
              </div>

              <div class="py-1">
                <button
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full text-left"
                  @click="handleLogout"
                >
                  <LogOut :size="16" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Suspension Warning Banner per P6.3 -->
    <div
      v-if="isSuspended"
      class="bg-danger-50 border-b border-danger-200 px-4 py-3 text-danger-800 text-sm text-center font-medium flex items-center justify-center gap-2"
    >
      <ShieldAlert :size="18" class="text-danger-600" />
      <span>
        Tài khoản của bạn đang bị giới hạn tạo yêu cầu mới
        <span v-if="authStore.user?.bookingSuspendedUntil">
          đến {{ new Date(authStore.user.bookingSuspendedUntil).toLocaleDateString('vi-VN') }}
        </span>
        do vi phạm quy định huỷ đơn.
      </span>
    </div>

    <!-- Main Content: max-width 1120px per P6.1 -->
    <main class="flex-1 max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-8">
      <router-view />
    </main>
  </div>
</template>
