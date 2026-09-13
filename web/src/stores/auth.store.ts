// src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo, UserRole, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../api/auth.api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<UserInfo | null>(null);
  const loading = ref<boolean>(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role?.toUpperCase() ?? null);
  const permissions = computed(() => user.value?.permissions ?? []);

  // Actions
  function setAuth(accessToken: string, userInfo: UserInfo) {
    token.value = accessToken;
    user.value = userInfo;
    localStorage.setItem('access_token', accessToken);
  }

  async function login(credentials: LoginRequest) {
    loading.value = true;
    try {
      const response = await authApi.login(credentials);
      setAuth(response.accessToken, response.user);
      return response.user;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterRequest) {
    loading.value = true;
    try {
      const response = await authApi.register(data);
      setAuth(response.accessToken, response.user);
      return response.user;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    if (!token.value) return null;
    try {
      const profile = await authApi.getProfile();
      user.value = profile;
      return profile;
    } catch {
      logout();
      return null;
    }
  }

  async function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    try {
      await authApi.logout();
    } catch {
      // ignore network error on logout
    }
  }

  function hasRole(role: UserRole | string): boolean {
    if (!user.value?.role) return false;
    return user.value.role.toUpperCase() === role.toUpperCase();
  }

  function hasAnyRole(roles: (UserRole | string)[]): boolean {
    if (!user.value?.role) return false;
    const current = user.value.role.toUpperCase();
    return roles.map((r) => r.toUpperCase()).includes(current);
  }

  function hasPermission(permissionCode: string): boolean {
    if (user.value?.role?.toUpperCase() === 'ADMIN') return true;
    return permissions.value.includes(permissionCode);
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    userRole,
    permissions,
    setAuth,
    login,
    register,
    fetchProfile,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
});
