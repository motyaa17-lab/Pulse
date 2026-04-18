export type ChatType = 'DIRECT' | 'GROUP' | 'CHANNEL' | 'SAVED';

export interface ChatListItem {
  id: string;
  type: ChatType;
  title: string | null;
  avatarUrl: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  /** Last message `MessageType` (for media-only previews). */
  lastMessageType?: string;
  /** First attachment `kind` when useful for preview. */
  lastAttachmentKind?: string;
  unreadCount: number;
  isPinned: boolean;
  pinOrder?: number | null;
  isArchived: boolean;
  isMuted: boolean;
  peer?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isOnline?: boolean;
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
  forwardedFromUser?: { id: string; username: string; displayName: string | null } | null;
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

export interface MeUserDto {
  id: string;
  email?: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  /** When false, other users do not see your last seen time. */
  shareLastSeen?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
