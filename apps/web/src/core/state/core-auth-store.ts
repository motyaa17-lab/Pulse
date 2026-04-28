'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CoreAuthStatus = 'idle' | 'checking' | 'ok' | 'error' | 'unauthenticated';

export type CoreAuthState = {
  accessToken: string | null;
  hasHydrated: boolean;
  status: CoreAuthStatus;
  error: string | null;
  setTokens: (t: { accessToken: string }) => void;
  setStatus: (s: CoreAuthStatus, err?: string | null) => void;
  clear: () => void;
};

export const useCoreAuthStore = create<CoreAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      hasHydrated: false,
      status: 'idle',
      error: null,
      setTokens: ({ accessToken }) => {
        set((s) => {
          if (s.accessToken === accessToken) return s;
          console.log('[AUTH STORE REAL UPDATE] core setTokens', {
            tokenStart: accessToken.slice(0, 12),
            tokenLen: accessToken.length,
          });
          return { ...s, accessToken, status: 'idle', error: null };
        });
      },
      setStatus: (status, err) => {
        const nextErr = err ?? null;
        set((s) => {
          if (s.status === status && s.error === nextErr) return s;
          console.log('[AUTH STORE REAL UPDATE] core setStatus', { from: s.status, to: status });
          return { ...s, status, error: nextErr };
        });
      },
      clear: () => {
        set((s) => {
          if (s.accessToken === null && s.status === 'unauthenticated' && s.error === null)
            return s;
          console.log('[AUTH STORE REAL UPDATE] core clear');
          return { ...s, accessToken: null, status: 'unauthenticated', error: null };
        });
      },
    }),
    {
      name: 'pulse-core-auth',
      partialize: (s) => ({ accessToken: s.accessToken }),
      onRehydrateStorage: () => () => {
        queueMicrotask(() => {
          if (!useCoreAuthStore.getState().hasHydrated) {
            console.log('[AUTH STORE REAL UPDATE] core set hasHydrated true');
            useCoreAuthStore.setState({ hasHydrated: true });
          }
        });
      },
    },
  ),
);
