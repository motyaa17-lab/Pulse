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
        const nextSessionId = sessionId ?? null;
        set((s) => {
          const prevAcc = s.accounts[id];
          const tokensUnchanged =
            s.accessToken === accessToken &&
            s.refreshToken === refreshToken &&
            s.sessionId === nextSessionId &&
            s.activeAccountId === id &&
            prevAcc?.accessToken === accessToken &&
            prevAcc?.refreshToken === refreshToken &&
            (prevAcc?.sessionId ?? null) === nextSessionId;
          if (tokensUnchanged) return s;

          const nextAccounts =
            prevAcc &&
            prevAcc.accessToken === accessToken &&
            prevAcc.refreshToken === refreshToken &&
            (prevAcc.sessionId ?? null) === nextSessionId
              ? s.accounts
              : {
                  ...s.accounts,
                  [id]: {
                    accessToken,
                    refreshToken,
                    sessionId: nextSessionId,
                    updatedAt: Date.now(),
                  },
                };

          return {
            ...s,
            accessToken,
            refreshToken,
            sessionId: nextSessionId,
            activeAccountId: id,
            accounts: nextAccounts,
          };
        });
        const cur = useAuthStore.getState().accessToken;
        if (cur === accessToken) void syncAccessTokenCookie(accessToken);
      },
      switchAccount: (accountId) => {
        set((s) => {
          const acc = s.accounts[accountId];
          if (!acc) return s;
          if (s.activeAccountId === accountId && s.accessToken === acc.accessToken) return s;
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
        const nextErr = err ?? null;
        set((s) => {
          if (s.sessionStatus === sessionStatus && s.sessionError === nextErr) return s;
          return { ...s, sessionStatus, sessionError: nextErr };
        });
      },
      clear: () => {
        set((s) => {
          // Avoid re-setting the same cleared state (can cause update storms if multiple callers clear).
          if (
            s.accessToken === null &&
            s.refreshToken === null &&
            s.sessionId === null &&
            s.activeAccountId === null &&
            s.sessionStatus === 'idle' &&
            s.sessionError === null
          ) {
            return s;
          }
          return {
            ...s,
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            activeAccountId: null,
            sessionStatus: 'idle',
            sessionError: null,
          };
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
      onRehydrateStorage: () => () => {
        // Rehydration can finish synchronously inside `create()` while `useAuthStore` is still in the
        // temporal dead zone — calling useAuthStore.setState immediately throws and never sets hasHydrated.
        queueMicrotask(() => {
          if (!useAuthStore.getState().hasHydrated) {
            useAuthStore.setState({ hasHydrated: true });
          }
          const t = useAuthStore.getState().accessToken;
          if (t) void syncAccessTokenCookie(t);
        });
      },
    },
  ),
);
