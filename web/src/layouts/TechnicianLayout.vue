<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Wrench,
  Inbox,
  Briefcase,
  DollarSign,
  Calendar,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const isAvailable = ref(true);
const avatarMenuOpen = ref(false);
const invitationCount = ref(3); // Demo badge count

const toggleAvailability = () => {
  isAvailable.value = !isAvailable.value;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ink-50 text-ink-900">
    <!-- Top Navigation Bar per P6.1 -->
    <header class="sticky top-0 z-30 bg-white border-b border-ink-200 shadow-[var(--shadow-e1)]">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Left: Logo + Tech Links -->
        <div class="flex items-center gap-8">
          <router-link to="/tech" class="inline-flex items-center gap-2">
            <div class="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white">
              <Wrench :size="20" />
            </div>
            <div>
              <span class="text-xl font-bold text-ink-900 tracking-tight">Fix<span class="text-brand-600">Home</span></span>
              <span class="block text-[10px] font-bold text-brand-700 -mt-1 tracking-wider uppercase">Thợ Chuyên Nghiệp</span>
            </div>
          </router-link>

          <!-- Nav Items -->
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700">
            <router-link
              to="/tech"
              class="hover:text-brand-600 transition-colors py-1 flex items-center gap-1.5"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
              exact-active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              <Briefcase :size="16" />
              Tổng quan
            </router-link>
            <router-link
              to="/tech/jobs"
              class="hover:text-brand-600 transition-colors py-1 flex items-center gap-1.5"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              <Wrench :size="16" />
              Đơn nhận việc
            </router-link>
            <router-link
              to="/tech/invitations"
              class="hover:text-brand-600 transition-colors py-1 flex items-center gap-1.5 relative"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              <Inbox :size="16" />
              <span>Hộp thư mời</span>
              <span
                v-if="invitationCount > 0"
                class="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-brand-600 text-white font-num leading-none"
              >
                {{ invitationCount }}
              </span>
            </router-link>
            <router-link
              to="/tech/schedule"
              class="hover:text-brand-600 transition-colors py-1 flex items-center gap-1.5"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              <Calendar :size="16" />
              Lịch làm việc
            </router-link>
            <router-link
              to="/tech/earnings"
              class="hover:text-brand-600 transition-colors py-1 flex items-center gap-1.5"
              active-class="text-brand-600 font-semibold border-b-2 border-brand-600"
            >
              <DollarSign :size="16" />
              Thu nhập
            </router-link>
          </nav>
        </div>

        <!-- Right Side: Availability Toggle per P6.1 + Avatar -->
        <div class="flex items-center gap-5">
          <!-- Availability Toggle -->
          <div class="flex items-center gap-2 bg-ink-25 px-3 py-1.5 rounded-[var(--radius-sm)] border border-ink-200">
            <button
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="isAvailable ? 'bg-success-600' : 'bg-ink-300'"
              @click="toggleAvailability"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                :class="isAvailable ? 'translate-x-4' : 'translate-x-0'"
              />
            </button>
            <span class="text-xs font-semibold select-none" :class="isAvailable ? 'text-success-600' : 'text-ink-500'">
              {{ isAvailable ? 'Đang nhận việc' : 'Tạm nghỉ' }}
            </span>
          </div>

          <!-- Avatar Dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-2 p-1.5 rounded-[var(--radius-sm)] hover:bg-ink-100 transition-colors"
              @click="avatarMenuOpen = !avatarMenuOpen"
            >
              <div class="w-8 h-8 rounded-full bg-brand-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                {{ authStore.user?.fullName?.charAt(0) ?? 'T' }}
              </div>
              <ChevronDown :size="16" class="text-ink-500" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="avatarMenuOpen"
              class="absolute right-0 mt-2 w-52 bg-white rounded-[var(--radius-md)] border border-ink-200 shadow-[var(--shadow-e3)] py-2 z-50 divide-y divide-ink-100"
              @click="avatarMenuOpen = false"
            >
              <div class="px-4 py-2">
                <p class="text-sm font-semibold text-ink-900 truncate">{{ authStore.user?.fullName }}</p>
                <p class="text-xs text-ink-500">Kỹ thuật viên</p>
              </div>

              <div class="py-1 text-sm text-ink-700">
                <router-link to="/tech/profile" class="flex items-center gap-2.5 px-4 py-2 hover:bg-ink-50">
                  <User :size="16" />
                  Hồ sơ thợ & Kỹ năng
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

    <!-- Main Content -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
      <router-view />
    </main>
  </div>
</template>
