<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-4 border-b border-gray-700 flex items-center gap-3">
        <img src="../assets/logo.png" alt="FixHome Logo" class="w-9 h-9 rounded-lg bg-white p-1 object-contain" />
        <div>
          <h1 class="text-xl font-bold leading-none">FixHome</h1>
          <p class="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
      </div>
      <nav class="flex-1 p-4">
        <router-link
          to="/dashboard"
          class="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Dashboard
        </router-link>
        <!-- TODO: Add navigation links as features are implemented -->
      </nav>
      <div class="p-4 border-t border-gray-700">
        <button
          class="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 bg-white shadow flex items-center justify-between px-6">
        <h2 class="text-lg font-semibold text-gray-800">
          <!-- Page title can be set via route meta -->
        </h2>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            {{ authStore.user?.fullName ?? 'User' }}
          </span>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6 bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
