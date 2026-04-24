'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncAccessTokenCookie } from '@/lib/session-cookie';
import { decodeJwtSub } from '@/lib/jwt';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  /** Saved accounts for quick switching (minimal multi-account). */
  accounts: Record<
    string,
    { accessToken: string; refreshToken: string; sessionId: string | null; updatedAt: number }
  >;
  activeAccountId: string | null;
  /** False until zustand persist has read localStorage (avoids treating pre-hydration as logged out). */
  hasHydrated: boolean;
  /** Runtime status of server session validation / refresh bootstrap. Not persisted. */
  sessionStatus: 'idle' | 'checking' | 'ok' | 'error';
  sessionError: string | null;
  setTokens: (t: { accessToken: string; refreshToken: string; sessionId?: string }) => void;
  switchAccount: (accountId: string) => void;
  removeAccount: (accountId: string) => void;
  setSessionStatus: (s: AuthState['sessionStatus'], err?: string | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      accounts: {},
      activeAccountId: null,
      hasHydrated: false,
      sessionStatus: 'idle',
      sessionError: null,
      setTokens: ({ accessToken, refreshToken, sessionId }) => {
        const id = decodeJwtSub(accessToken) ?? accessToken.slice(0, 16);
        set((s) => ({
          accessToken,
          refreshToken,
          sessionId: sessionId ?? null,
          activeAccountId: id,
          accounts: {
            ...s.accounts,
            [id]: {
              accessToken,
              refreshToken,
              sessionId: sessionId ?? null,
              updatedAt: Date.now(),
            },
          },
        }));
        void syncAccessTokenCookie(accessToken);
      },
      switchAccount: (accountId) => {
        set((s) => {
          const acc = s.accounts[accountId];
          if (!acc) return s;
          void syncAccessTokenCookie(acc.accessToken);
          return {
            ...s,
            accessToken: acc.accessToken,
            refreshToken: acc.refreshToken,
            sessionId: acc.sessionId,
            activeAccountId: accountId,
            sessionStatus: 'idle',
            sessionError: null,
          };
        });
      },
      removeAccount: (accountId) => {
        set((s) => {
          const next = { ...s.accounts };
          delete next[accountId];
          const wasActive = s.activeAccountId === accountId;
          if (!wasActive) return { ...s, accounts: next };
          void syncAccessTokenCookie(null);
          return {
            ...s,
            accounts: next,
            activeAccountId: null,
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            sessionStatus: 'idle',
            sessionError: null,
          };
        });
      },
      setSessionStatus: (sessionStatus, err) => {
        set({ sessionStatus, sessionError: err ?? null });
      },
      clear: () => {
        set({
          accessToken: null,
          refreshToken: null,
          sessionId: null,
          activeAccountId: null,
          sessionStatus: 'idle',
          sessionError: null,
        });
        void syncAccessTokenCookie(null);
      },
    }),
    {
      name: 'pulse-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        sessionId: state.sessionId,
        accounts: state.accounts,
        activeAccountId: state.activeAccountId,
      }),
      onRehydrateStorage: () => (_state, error) => {
        // DEBUG: trace persist lifecycle (remove when stable)
        console.log('[pulse-bootstrap] persist onRehydrateStorage fired', {
          error: error instanceof Error ? error.message : (error ?? null),
        });
        // Rehydration can finish synchronously inside `create()` while `useAuthStore` is still in the
        // temporal dead zone — calling useAuthStore.setState immediately throws and never sets hasHydrated.
        queueMicrotask(() => {
          if (!useAuthStore.getState().hasHydrated) {
            console.log('[pulse-bootstrap] persist microtask: set hasHydrated true');
            useAuthStore.setState({ hasHydrated: true });
          }
          const t = useAuthStore.getState().accessToken;
          if (t) void syncAccessTokenCookie(t);
        });
      },
    },
  ),
);
