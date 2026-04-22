'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type VisualPreset = 'default' | 'ocean' | 'sunset' | 'forest';

type UiState = {
  theme: 'light' | 'dark' | 'system';
  visualPreset: VisualPreset;
  soundEnabled: boolean;
  /** When true, prefer less animation/transition work (Telegram-like Reduce Motion). */
  reduceMotion: boolean;
  /** When true, chat list hides last message text (previews) for shoulder-surfing resistance. */
  hideChatListPreviews: boolean;
  sidebarOpen: boolean;
  /** When navigating to /chats from elsewhere, open list + focus search once. */
  pendingSidebarSearchFocus: boolean;
  detailsOpen: boolean;
  searchOpen: boolean;
  typingByChat: Record<string, boolean>;
  /** null = no active socket session; true/false from socket connect/disconnect. */
  wsConnected: boolean | null;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  setVisualPreset: (v: VisualPreset) => void;
  setSoundEnabled: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setHideChatListPreviews: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setPendingSidebarSearchFocus: (v: boolean) => void;
  setDetailsOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setTypingForChat: (chatId: string, typing: boolean) => void;
  setWsConnected: (v: boolean | null) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      visualPreset: 'default',
      soundEnabled: true,
      reduceMotion: false,
      hideChatListPreviews: false,
      sidebarOpen: true,
      pendingSidebarSearchFocus: false,
      detailsOpen: false,
      searchOpen: false,
      typingByChat: {},
      wsConnected: null,
      setTheme: (theme) => set({ theme }),
      setVisualPreset: (visualPreset) => set({ visualPreset }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHideChatListPreviews: (hideChatListPreviews) => set({ hideChatListPreviews }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setPendingSidebarSearchFocus: (pendingSidebarSearchFocus) =>
        set({ pendingSidebarSearchFocus }),
      setDetailsOpen: (detailsOpen) => set({ detailsOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setTypingForChat: (chatId, typing) =>
        set((s) => ({
          typingByChat: typing
            ? { ...s.typingByChat, [chatId]: true }
            : Object.fromEntries(Object.entries(s.typingByChat).filter(([k]) => k !== chatId)),
        })),
      setWsConnected: (wsConnected) => set({ wsConnected }),
    }),
    {
      name: 'pulse-ui',
      partialize: (s) => ({
        theme: s.theme,
        visualPreset: s.visualPreset,
        soundEnabled: s.soundEnabled,
        reduceMotion: s.reduceMotion,
        hideChatListPreviews: s.hideChatListPreviews,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
