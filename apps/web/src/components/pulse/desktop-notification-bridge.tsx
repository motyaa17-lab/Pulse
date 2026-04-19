'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { decodeJwtSub } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth-store';
import type { ChatListItem, MeUserDto } from '@/lib/types';
import { useT, type I18nKey } from '@/lib/i18n';

/**
 * Browser desktop notifications for incoming messages (when enabled in settings + permission granted).
 * Relies on `chat:updated` which is emitted to each member's `user:{id}` socket room.
 */
export function DesktopNotificationBridge() {
  const pathname = usePathname();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const myId = decodeJwtSub(accessToken);
  const t = useT();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (!accessToken || !myId) return;
    const s = connectSocket();

    const onChatUpdated = (payload: unknown) => {
      const p = payload as {
        chatId?: string;
        preview?: string;
        lastMessageType?: string;
        lastAttachmentKind?: string | null;
        lastMessageSenderId?: string | null;
      };
      if (!p?.chatId) return;
      if (!p.lastMessageSenderId || p.lastMessageSenderId === myId) return;

      const prefs = me?.notificationPrefs;
      if (!prefs?.desktopEnabled) return;

      const bare = pathname?.split('?')[0] ?? '';
      const parts = bare.split('/').filter(Boolean);
      const activeChatId = parts[0] === 'chats' && parts[1] ? parts[1] : null;
      if (
        p.chatId === activeChatId &&
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      )
        return;

      const lists = qc.getQueriesData<ChatListItem[]>({ queryKey: ['chats'] });
      const flat = lists.flatMap(([, d]) => d ?? []);
      const chat = flat.find((c) => c.id === p.chatId);
      if (!chat || chat.isMuted) return;

      if (
        prefs.mentionOnlyInChannels &&
        chat.type === 'CHANNEL' &&
        !(p.preview ?? '').includes('@')
      ) {
        return;
      }

      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      const title =
        chat.title?.trim() ||
        chat.peer?.displayName?.trim() ||
        chat.peer?.username ||
        t('chatFallback');
      const body = prefs.showPreview
        ? p.preview?.trim() || previewFallback(p, t)
        : t('notifyNewMessageGeneric');

      try {
        const tag = `pulse:${p.chatId}`;
        const n = new Notification(title, { body, tag, silent: true });
        n.onclick = () => {
          window.focus();
          window.location.assign(`/chats/${p.chatId}`);
        };
      } catch {
        /* ignore */
      }
    };

    s.on('chat:updated', onChatUpdated);
    return () => {
      s.off('chat:updated', onChatUpdated);
    };
  }, [accessToken, me?.notificationPrefs, myId, pathname, qc, t]);

  return null;
}

function previewFallback(
  p: { lastMessageType?: string; lastAttachmentKind?: string | null },
  t: (k: I18nKey) => string,
): string {
  const kind = p.lastAttachmentKind;
  const type = p.lastMessageType;
  if (type === 'VOICE' || kind === 'voice') return t('previewVoice');
  if (type === 'IMAGE' || kind === 'image') return t('previewPhoto');
  if (type === 'VIDEO' || kind === 'video') return t('previewVideo');
  if (type === 'FILE' || kind === 'file') return t('previewFile');
  return t('notifyNewMessageGeneric');
}
