// src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo, UserRole } from '../types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<UserInfo | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role ?? null);

  // Actions
  function setAuth(accessToken: string, userInfo: UserInfo) {
    token.value = accessToken;
    user.value = userInfo;
    localStorage.setItem('access_token', accessToken);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
  }

  function hasRole(role: UserRole): boolean {
    return user.value?.role === role;
  }

  function hasAnyRole(roles: UserRole[]): boolean {
    return user.value ? roles.includes(user.value.role) : false;
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    setAuth,
    logout,
    hasRole,
    hasAnyRole,
  };
});
