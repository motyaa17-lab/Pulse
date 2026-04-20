import type { ChatListItem } from '@/lib/types';

export function chatHref(chat: Pick<ChatListItem, 'id' | 'type'>): string {
  // Telegram-like: opening a chat always goes to the conversation screen.
  // Group/channel settings live on dedicated routes and are opened from the chat header.
  return `/chats/${chat.id}`;
}
