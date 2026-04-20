import type { ChatListItem } from '@/lib/types';

export function chatHref(chat: Pick<ChatListItem, 'id' | 'type'>): string {
  if (chat.type === 'GROUP') return `/chats/${chat.id}/group`;
  if (chat.type === 'CHANNEL') return `/chats/${chat.id}/channel`;
  return `/chats/${chat.id}`;
}
