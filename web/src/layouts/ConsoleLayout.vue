<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Wrench,
  LayoutDashboard,
  KanbanSquare,
  Users,
  UserCheck,
  Ban,
  ShieldAlert,
  FolderKanban,
  Sliders,
  Cpu,
  FileText,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isCollapsed = ref(false);

const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const navigation = computed(() => [
  {
    group: 'Vận hành (Operations)',
    items: [
      { label: 'Tổng quan vận hành', path: '/console', icon: LayoutDashboard },
      { label: 'Board đơn sửa chữa', path: '/console/orders', icon: KanbanSquare },
      { label: 'Điều phối & Ghép thợ', path: '/console/matching', icon: UserCheck },
      { label: 'Kỹ thuật viên & Duyệt', path: '/console/technicians', icon: Users },
      { label: 'Huỷ đơn & Khiếu nại', path: '/console/cancellations', icon: Ban },
      { label: 'Vi phạm & Khoá tài khoản', path: '/console/strikes', icon: ShieldAlert },
      { label: 'Danh mục & Bảng giá', path: '/console/catalog', icon: FolderKanban },
      { label: 'Khu vực hoạt động', path: '/console/service-areas', icon: MapPin },
    ],
  },
  ...(isAdmin.value
    ? [
        {
          group: 'Quản trị hệ thống (Admin)',
          items: [
            { label: 'Quản lý người dùng', path: '/console/admin/users', icon: Users },
            { label: 'Cấu hình hệ thống (24)', path: '/console/admin/config', icon: Sliders },
            { label: 'Giám sát AI chẩn đoán', path: '/console/admin/ai-monitor', icon: Cpu },
            { label: 'Nhật ký kiểm toán', path: '/console/admin/audit', icon: FileText },
            { label: 'Sức khoẻ hệ thống', path: '/console/admin/system', icon: Activity },
          ],
        },
      ]
    : []),
]);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex bg-ink-50 text-ink-900">
    <!-- Left Sidebar: collapsible 240px / 72px per P6.1 -->
    <aside
      class="sticky top-0 h-screen z-30 bg-ink-900 text-white flex flex-col justify-between transition-all duration-200 shrink-0 select-none border-r border-ink-800"
      :class="isCollapsed ? 'w-[72px]' : 'w-[240px]'"
    >
      <!-- Brand & Collapse Trigger -->
      <div>
        <div class="h-16 flex items-center px-4 border-b border-ink-800 justify-between">
          <router-link to="/console" class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-9 h-9 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center text-white shrink-0">
              <Wrench :size="20" />
            </div>
            <div v-if="!isCollapsed" class="whitespace-nowrap">
              <span class="text-lg font-bold tracking-tight">Fix<span class="text-brand-400">Home</span></span>
              <span class="block text-[10px] font-semibold text-brand-300 uppercase tracking-widest -mt-1">
                {{ isAdmin ? 'Admin Console' : 'Manager Console' }}
              </span>
            </div>
          </router-link>

          <button
            class="text-ink-400 hover:text-white p-1 rounded transition-colors hidden sm:block"
            @click="isCollapsed = !isCollapsed"
          >
            <component :is="isCollapsed ? ChevronRight : ChevronLeft" :size="18" />
          </button>
        </div>

        <!-- Navigation Menu -->
        <div class="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div v-for="group in navigation" :key="group.group" class="space-y-1">
            <div
              v-if="!isCollapsed"
              class="px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-400 mb-2"
            >
              {{ group.group }}
            </div>

            <router-link
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors group"
              :class="[
                route.path === item.path
                  ? 'bg-brand-600 text-white font-medium shadow-sm'
                  : 'text-ink-300 hover:bg-ink-800 hover:text-white',
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <component :is="item.icon" :size="18" class="shrink-0" />
              <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- User Profile & Logout at Bottom -->
      <div class="p-3 border-t border-ink-800 bg-ink-950/40">
        <div class="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--radius-sm)] overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {{ authStore.user?.fullName?.charAt(0) ?? 'A' }}
          </div>
          <div v-if="!isCollapsed" class="truncate flex-1 min-w-0">
            <p class="text-xs font-semibold text-white truncate">{{ authStore.user?.fullName }}</p>
            <p class="text-[11px] text-ink-400 truncate">{{ authStore.user?.role }}</p>
          </div>
          <button
            v-if="!isCollapsed"
            class="text-ink-400 hover:text-danger-400 p-1 rounded transition-colors"
            title="Đăng xuất"
            @click="handleLogout"
          >
            <LogOut :size="16" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar with Breadcrumbs per P6.1 -->
      <header class="h-16 bg-white border-b border-ink-200 px-6 sm:px-8 flex items-center justify-between shadow-[var(--shadow-e1)]">
        <!-- Breadcrumb / Route Title -->
        <div class="flex items-center gap-2 text-sm text-ink-500">
          <span class="font-medium text-ink-700">Console</span>
          <span>/</span>
          <span class="font-semibold text-ink-900">{{ route.meta?.title ?? 'Dashboard' }}</span>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-xs font-semibold px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200 uppercase">
            {{ authStore.user?.role }}
          </div>
        </div>
      </header>

      <!-- Main Content Container: max-width 1440px per P7.4 -->
      <main class="flex-1 p-6 sm:p-8 max-w-[1440px] w-full mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
