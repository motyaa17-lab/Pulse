'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type VisualPreset = 'default' | 'ocean' | 'sunset' | 'forest';

type UiState = {
  theme: 'light' | 'dark' | 'system';
  visualPreset: VisualPreset;
  soundEnabled: boolean;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  searchOpen: boolean;
  typingByChat: Record<string, boolean>;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  setVisualPreset: (v: VisualPreset) => void;
  setSoundEnabled: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setDetailsOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setTypingForChat: (chatId: string, typing: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      visualPreset: 'default',
      soundEnabled: true,
      sidebarOpen: true,
      detailsOpen: false,
      searchOpen: false,
      typingByChat: {},
      setTheme: (theme) => set({ theme }),
      setVisualPreset: (visualPreset) => set({ visualPreset }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setTypingForChat: (chatId, typing) =>
        set((s) => ({
          typingByChat: typing
            ? { ...s.typingByChat, [chatId]: true }
            : Object.fromEntries(Object.entries(s.typingByChat).filter(([k]) => k !== chatId)),
        })),
    }),
    {
      name: 'pulse-ui',
      partialize: (s) => ({
        visualPreset: s.visualPreset,
        soundEnabled: s.soundEnabled,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
