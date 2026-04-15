'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  /** False until zustand persist has read localStorage (avoids treating pre-hydration as logged out). */
  hasHydrated: boolean;
  setTokens: (t: {
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
  }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      hasHydrated: false,
      setTokens: ({ accessToken, refreshToken, sessionId }) =>
        set({ accessToken, refreshToken, sessionId: sessionId ?? null }),
      clear: () => set({ accessToken: null, refreshToken: null, sessionId: null }),
    }),
    {
      name: 'pulse-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        sessionId: state.sessionId,
      }),
      onRehydrateStorage: () => (_state, error) => {
        // DEBUG: trace persist lifecycle (remove when stable)
        console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
          error: error instanceof Error ? error.message : error ?? null,
        });
        // Rehydration can finish synchronously inside `create()` while `useAuthStore` is still in the
        // temporal dead zone — calling useAuthStore.setState immediately throws and never sets hasHydrated.
        queueMicrotask(() => {
          console.log('[pulse-bootstrap] persist microtask: set hasHydrated true');
          useAuthStore.setState({ hasHydrated: true });
        });
      },
    },
  ),
);
