'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
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
      setTokens: ({ accessToken, refreshToken, sessionId }) =>
        set({ accessToken, refreshToken, sessionId: sessionId ?? null }),
      clear: () => set({ accessToken: null, refreshToken: null, sessionId: null }),
    }),
    { name: 'pulse-auth' },
  ),
);
