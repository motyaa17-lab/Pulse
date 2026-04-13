import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatType, MemberRole, MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { WsService } from '../ws/ws.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chats: ChatsService,
    private readonly ws: WsService,
    private readonly users: UsersService,
  ) {}

  private async assertCanPost(chatId: string, userId: string) {
    const member = await this.chats.assertMember(chatId, userId);
    const chat = member.chat;
    if (chat.type === ChatType.CHANNEL) {
      if (member.role === MemberRole.SUBSCRIBER) {
        throw new ForbiddenException('Subscribers cannot post in this channel');
      }
    }
    return { member, chat };
  }

  async create(userId: string, chatId: string, dto: CreateMessageDto) {
    await this.assertCanPost(chatId, userId);

    const hasText = Boolean(dto.text?.trim());
    const hasAtt = Boolean(dto.attachments?.length);
    if (!hasText && !hasAtt) throw new BadRequestException('Empty message');

    let type: MessageType = MessageType.TEXT;
    if (hasAtt) {
      const k = dto.attachments![0].kind;
      if (k === 'voice') type = MessageType.VOICE;
      else if (k === 'image') type = MessageType.IMAGE;
      else if (k === 'video') type = MessageType.VIDEO;
      else type = MessageType.FILE;
    }

    if (dto.replyToMessageId) {
      const parent = await this.prisma.message.findFirst({
        where: { id: dto.replyToMessageId, chatId },
      });
      if (!parent) throw new BadRequestException('Invalid reply target');
    }

    let forwardedFromUserId: string | null = null;
    if (dto.forwardedFromMessageId) {
      const src = await this.prisma.message.findUnique({
        where: { id: dto.forwardedFromMessageId },
        include: { sender: true },
      });
      if (!src) throw new BadRequestException('Invalid forward source');
      forwardedFromUserId = src.senderId;
    }

    const msg = await this.prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        type,
        text: dto.text?.trim() || null,
        clientTempId: dto.clientTempId ?? null,
        replyToMessageId: dto.replyToMessageId ?? null,
        forwardedFromMessageId: dto.forwardedFromMessageId ?? null,
        forwardedFromUserId,
        attachments: dto.attachments?.length
          ? {
              create: dto.attachments.map((a) => ({
                storageKey: a.storageKey,
                kind: a.kind,
                fileName: a.fileName,
                mimeType: a.mimeType,
                sizeBytes: a.sizeBytes,
                url: a.url,
                durationSec: a.durationSec ?? null,
                waveformJson: a.waveformJson ?? null,
              })),
            }
          : undefined,
      },
      include: this.messageInclude(),
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const payload = await this.toDto(msg, userId);
    this.ws.emitToChat(chatId, 'message:new', payload);

    const members = await this.prisma.chatMember.findMany({
      where: { chatId, leftAt: null },
      select: { userId: true },
    });
    this.ws.emitToUsers(
      members.map((m) => m.userId),
      'chat:updated',
      { chatId, lastMessageAt: msg.createdAt.toISOString(), preview: payload.text?.slice(0, 160) },
    );

    return payload;
  }

  async list(chatId: string, userId: string, cursor?: string, take = 40) {
    await this.chats.assertMember(chatId, userId);

    const where: Prisma.MessageWhereInput = { chatId };
    if (cursor) {
      const cur = await this.prisma.message.findUnique({ where: { id: cursor } });
      if (cur) {
        where.OR = [
          { createdAt: { lt: cur.createdAt } },
          { AND: [{ createdAt: cur.createdAt }, { id: { lt: cur.id } }] },
        ];
      }
    }

    const rows = await this.prisma.message.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      include: this.messageInclude(),
    });

    const ordered = rows.reverse();
    const nextCursor = ordered.length ? ordered[0].id : null;
    const items = await Promise.all(ordered.map((m) => this.toDto(m, userId)));
    return { items, nextCursor };
  }

  async edit(userId: string, chatId: string, messageId: string, dto: EditMessageDto) {
    await this.chats.assertMember(chatId, userId);
    const msg = await this.prisma.message.findFirst({
      where: { id: messageId, chatId, deletedAt: null },
    });
    if (!msg) throw new NotFoundException();
    if (msg.senderId !== userId) throw new ForbiddenException();
    if (msg.type !== MessageType.TEXT) throw new BadRequestException('Only text messages can be edited');

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { text: dto.text, editedAt: new Date() },
      include: this.messageInclude(),
    });
    const payload = await this.toDto(updated, userId);
    this.ws.emitToChat(chatId, 'message:updated', payload);
    return payload;
  }

  async softDelete(userId: string, chatId: string, messageId: string) {
    await this.chats.assertMember(chatId, userId);
    const msg = await this.prisma.message.findFirst({ where: { id: messageId, chatId } });
    if (!msg) throw new NotFoundException();
    if (msg.senderId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), text: null },
      include: this.messageInclude(),
    });
    const payload = await this.toDto(updated, userId);
    this.ws.emitToChat(chatId, 'message:deleted', { id: messageId, chatId });
    this.ws.emitToChat(chatId, 'message:updated', payload);
    return payload;
  }

  async addReaction(userId: string, chatId: string, messageId: string, emoji: string) {
    await this.chats.assertMember(chatId, userId);
    const msg = await this.prisma.message.findFirst({ where: { id: messageId, chatId } });
    if (!msg) throw new NotFoundException();

    await this.prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
      create: { messageId, userId, emoji },
      update: {},
    });

    const full = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: this.messageInclude(),
    });
    const payload = await this.toDto(full!, userId);
    this.ws.emitToChat(chatId, 'reaction:update', { messageId, reactions: payload.reactions });
    return payload.reactions;
  }

  async removeReaction(userId: string, chatId: string, messageId: string, emoji: string) {
    await this.chats.assertMember(chatId, userId);
    await this.prisma.messageReaction.deleteMany({ where: { messageId, userId, emoji } });
    const full = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: this.messageInclude(),
    });
    const payload = await this.toDto(full!, userId);
    this.ws.emitToChat(chatId, 'reaction:update', { messageId, reactions: payload.reactions });
    return payload.reactions;
  }

  async markRead(userId: string, chatId: string, messageId: string) {
    await this.chats.assertMember(chatId, userId);
    const msg = await this.prisma.message.findFirst({ where: { id: messageId, chatId } });
    if (!msg) throw new NotFoundException();

    await this.prisma.readState.upsert({
      where: { chatId_userId: { chatId, userId } },
      create: { chatId, userId, lastReadMessageId: messageId, lastReadAt: new Date() },
      update: { lastReadMessageId: messageId, lastReadAt: new Date() },
    });

    await this.users.touchLastSeen(userId);

    this.ws.emitToChat(chatId, 'message:readUpdate', {
      chatId,
      userId,
      messageId,
      readAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  async markDelivered(userId: string, chatId: string, messageId: string) {
    await this.chats.assertMember(chatId, userId);
    await this.prisma.readState.upsert({
      where: { chatId_userId: { chatId, userId } },
      create: { chatId, userId, lastDeliveredMsgId: messageId },
      update: { lastDeliveredMsgId: messageId },
    });
    return { ok: true };
  }

  private messageInclude(): Prisma.MessageInclude {
    return {
      attachments: true,
      reactions: true,
      replyTo: { include: { attachments: true, reactions: true } },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async toDto(msg: any, viewerId: string) {
    const reactionsMap = new Map<string, string[]>();
    for (const r of msg.reactions) {
      const arr = reactionsMap.get(r.emoji) ?? [];
      arr.push(r.userId);
      reactionsMap.set(r.emoji, arr);
    }
    const reactions = [...reactionsMap.entries()].map(([emoji, userIds]) => ({
      emoji,
      userIds,
      count: userIds.length,
    }));

    let deliveryStatus: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' = 'SENT';
    if (msg.senderId === viewerId) {
      const members = await this.prisma.chatMember.findMany({
        where: { chatId: msg.chatId, leftAt: null, NOT: { userId: viewerId } },
        select: { userId: true },
      });
      if (members.length === 0) deliveryStatus = 'READ';
      else {
        const states = await this.prisma.readState.findMany({
          where: { chatId: msg.chatId, userId: { in: members.map((m) => m.userId) } },
        });
        const allReadByTime = await Promise.all(
          members.map(async (m) => {
            const st = states.find((s) => s.userId === m.userId);
            if (!st?.lastReadMessageId) return false;
            const rm = await this.prisma.message.findUnique({ where: { id: st.lastReadMessageId } });
            return rm && rm.createdAt >= msg.createdAt;
          }),
        );
        if (allReadByTime.every(Boolean)) deliveryStatus = 'READ';
        else {
          const allDel = states.every((s) => s.lastDeliveredMsgId);
          deliveryStatus = allDel ? 'DELIVERED' : 'SENT';
        }
      }
    }

    return {
      id: msg.id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      type: msg.type,
      text: msg.deletedAt ? null : msg.text,
      clientTempId: msg.clientTempId,
      replyToMessageId: msg.replyToMessageId,
      forwardedFromMessageId: msg.forwardedFromMessageId,
      editedAt: msg.editedAt?.toISOString() ?? null,
      deletedAt: msg.deletedAt?.toISOString() ?? null,
      createdAt: msg.createdAt.toISOString(),
      attachments: msg.attachments.map((a: (typeof msg.attachments)[number]) => ({
        id: a.id,
        kind: a.kind,
        fileName: a.fileName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        url: a.url,
        durationSec: a.durationSec,
        waveformJson: a.waveformJson,
      })),
      reactions,
      replyTo: msg.replyTo
        ? {
            id: msg.replyTo.id,
            text: msg.replyTo.deletedAt ? null : msg.replyTo.text,
            senderId: msg.replyTo.senderId,
            deletedAt: msg.replyTo.deletedAt?.toISOString() ?? null,
          }
        : null,
      deliveryStatus: msg.senderId === viewerId ? deliveryStatus : undefined,
    };
  }
}
