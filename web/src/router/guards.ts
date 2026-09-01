// src/router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores';

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();

  // Routes that require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Routes that require specific roles
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const hasPermission = authStore.hasAnyRole(to.meta.roles);
    if (!hasPermission) {
      return next({ name: 'forbidden' });
    }
  }

  // Redirect to dashboard if already logged in and visiting auth pages
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  next();
}
