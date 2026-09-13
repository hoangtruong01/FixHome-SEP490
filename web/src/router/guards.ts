// src/router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores';

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();

  // If token exists in storage but profile not yet in memory, fetch it
  if (authStore.token && !authStore.user) {
    await authStore.fetchProfile();
  }

  // 1. Guest only pages (login, register)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const role = authStore.userRole;
    if (role === 'ADMIN' || role === 'SERVICE_MANAGER') {
      return next('/console');
    }
    if (role === 'TECHNICIAN') {
      return next('/tech');
    }
    return next('/app');
  }

  // 2. Requires Authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // 3. Role enforcement (P6.3: never redirect to login on role failure, redirect to /403)
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const hasRole = authStore.hasAnyRole(to.meta.roles as string[]);
    if (!hasRole) {
      return next('/403');
    }
  }

  // 4. Permission enforcement (D-18 / P6.3)
  if (to.meta.permission && typeof to.meta.permission === 'string') {
    const hasPerm = authStore.hasPermission(to.meta.permission);
    if (!hasPerm) {
      return next('/403');
    }
  }

  next();
}
