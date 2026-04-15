'use client';

import { create } from 'zustand';

type UiState = {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  detailsOpen: boolean;
  searchOpen: boolean;
  typingByChat: Record<string, boolean>;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setDetailsOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setTypingForChat: (chatId: string, typing: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  theme: 'system',
  sidebarOpen: true,
  detailsOpen: false,
  searchOpen: false,
  typingByChat: {},
  setTheme: (theme) => set({ theme }),
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
}));
