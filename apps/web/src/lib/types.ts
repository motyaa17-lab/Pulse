export type ChatType = 'DIRECT' | 'GROUP' | 'CHANNEL' | 'SAVED';

export interface ChatListItem {
  id: string;
  type: ChatType;
  title: string | null;
  avatarUrl: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  peer?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface MessageDto {
  id: string;
  chatId: string;
  senderId: string | null;
  type: string;
  text: string | null;
  clientTempId: string | null;
  replyToMessageId: string | null;
  forwardedFromMessageId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  attachments: {
    id: string;
    kind: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    durationSec?: number | null;
  }[];
  reactions: { emoji: string; userIds: string[]; count: number }[];
  replyTo?: {
    id: string;
    text: string | null;
    senderId: string | null;
    deletedAt: string | null;
  } | null;
  deliveryStatus?: string;
}
