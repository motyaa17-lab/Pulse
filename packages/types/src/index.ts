export type ChatType = 'DIRECT' | 'GROUP' | 'CHANNEL' | 'SAVED';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'SUBSCRIBER';

export type MessageType = 'TEXT' | 'VOICE' | 'FILE' | 'IMAGE' | 'VIDEO' | 'SYSTEM';

export type MessageDeliveryStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPublic {
  id: string;
  email?: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  lastSeenAt: string | null;
  isOnline?: boolean;
}

export interface SessionDto {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface ChatListItemDto {
  id: string;
  type: ChatType;
  title: string | null;
  avatarUrl: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  peer?: UserPublic | null;
}

export interface MessageAttachmentDto {
  id: string;
  kind: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  durationSec?: number | null;
  waveformJson?: string | null;
}

export interface MessageReactionDto {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface MessageDto {
  id: string;
  chatId: string;
  senderId: string | null;
  type: MessageType;
  text: string | null;
  clientTempId: string | null;
  replyToMessageId: string | null;
  forwardedFromMessageId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  attachments: MessageAttachmentDto[];
  reactions: MessageReactionDto[];
  replyTo?: Pick<MessageDto, 'id' | 'text' | 'senderId' | 'deletedAt'> | null;
  deliveryStatus?: MessageDeliveryStatus;
}

export type WsClientEvent =
  | 'chat:join'
  | 'chat:leave'
  | 'message:typing'
  | 'message:read'
  | 'reaction:add'
  | 'reaction:remove'
  | 'presence:ping';

export type WsServerEvent =
  | 'message:new'
  | 'message:updated'
  | 'message:deleted'
  | 'message:readUpdate'
  | 'chat:updated'
  | 'typing:update'
  | 'presence:update'
  | 'reaction:update';
