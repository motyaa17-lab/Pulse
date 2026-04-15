'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DraftState = {
  drafts: Record<string, string>;
  setDraft: (chatId: string, text: string) => void;
  clearDraft: (chatId: string) => void;
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (chatId, text) =>
        set((s) => {
          // Avoid storing tons of whitespace.
          const next = text;
          if (!next) {
            const { [chatId]: _omit, ...rest } = s.drafts;
            return { drafts: rest };
          }
          return { drafts: { ...s.drafts, [chatId]: next } };
        }),
      clearDraft: (chatId) =>
        set((s) => {
          const { [chatId]: _omit, ...rest } = s.drafts;
          return { drafts: rest };
        }),
    }),
    { name: 'pulse-drafts' },
  ),
);

