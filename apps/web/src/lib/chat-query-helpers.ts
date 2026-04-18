import type { QueryClient } from '@tanstack/react-query';
import type { ChatListItem } from '@/lib/types';

/** Update sidebar list previews without refetching `/chats` (avoids blocking UI on large list loads). */
export function bumpChatListPreview(
  qc: QueryClient,
  chatId: string,
  preview: string,
  lastMessageAtIso: string,
  meta?: {
    lastMessageType?: string | null;
    lastAttachmentKind?: string | null;
    /** Clear type/kind (e.g. after delete-for-everyone). */
    clearListMeta?: boolean;
  },
) {
  qc.setQueriesData<ChatListItem[]>({ queryKey: ['chats'] }, (old: ChatListItem[] | undefined) => {
    if (!old) return old;
    const idx = old.findIndex((c: ChatListItem) => c.id === chatId);
    if (idx < 0) return old;
    const next = [...old];
    const metaPatch = meta?.clearListMeta
      ? { lastMessageType: undefined, lastAttachmentKind: undefined }
      : {
          ...(meta?.lastMessageType !== undefined
            ? { lastMessageType: meta.lastMessageType ?? undefined }
            : {}),
          ...(meta?.lastAttachmentKind !== undefined
            ? { lastAttachmentKind: meta.lastAttachmentKind ?? undefined }
            : {}),
        };
    next[idx] = {
      ...next[idx],
      lastMessagePreview: preview.slice(0, 160),
      lastMessageAt: lastMessageAtIso,
      ...metaPatch,
    };
    next.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
    return next;
  });
}
