'use client';

import { create } from 'zustand';

export type PendingAttachment = {
  localId: string;
  chatId: string;
  storageKey: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'video' | 'file' | 'voice';
  createdAt: number;
};

type PendingAttachmentsState = {
  byChat: Record<string, PendingAttachment[]>;
  add: (chatId: string, att: Omit<PendingAttachment, 'chatId'>) => void;
  remove: (chatId: string, localId: string) => void;
  clear: (chatId: string) => void;
};

export const usePendingAttachmentsStore = create<PendingAttachmentsState>((set) => ({
  byChat: {},
  add: (chatId, att) =>
    set((s) => ({
      byChat: {
        ...s.byChat,
        [chatId]: [...(s.byChat[chatId] ?? []), { ...att, chatId }],
      },
    })),
  remove: (chatId, localId) =>
    set((s) => ({
      byChat: {
        ...s.byChat,
        [chatId]: (s.byChat[chatId] ?? []).filter((a) => a.localId !== localId),
      },
    })),
  clear: (chatId) =>
    set((s) => {
      const { [chatId]: _omit, ...rest } = s.byChat;
      return { byChat: rest };
    }),
}));

