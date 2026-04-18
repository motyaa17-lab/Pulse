import type { MessageDto } from '@/lib/types';

/** Fields for chat list bump + display when last message has no text (media / voice / etc.). */
export function bumpMetaFromMessage(m: Pick<MessageDto, 'text' | 'type' | 'attachments'>) {
  const preview = m.text?.trim() ? m.text.trim().slice(0, 160) : '';
  const lastAttachmentKind = m.attachments?.[0]?.kind;
  return {
    preview,
    lastMessageType: m.type,
    lastAttachmentKind,
  } as const;
}
