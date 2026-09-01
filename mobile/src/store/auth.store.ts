// src/store/auth.store.ts
import { create } from 'zustand';
import type { UserInfo } from '../types';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check stored token

  setAuth: (token: string, user: UserInfo) =>
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
