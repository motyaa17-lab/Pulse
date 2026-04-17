import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ChatType, MemberRole, MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from '../redis/presence.service';
import { CreateDirectDto } from './dto/direct.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddMemberDto } from './dto/members.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async assertMember(chatId: string, userId: string) {
    const m = await this.prisma.chatMember.findFirst({
      where: { chatId, userId, leftAt: null },
      include: { chat: true },
    });
    if (!m) throw new ForbiddenException('Not a member of this chat');
    return m;
  }

  async assertAdminOrOwner(chatId: string, userId: string) {
    const m = await this.assertMember(chatId, userId);
    if (m.role !== MemberRole.OWNER && m.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return m;
  }

  async getOrCreateDirect(userId: string, dto: CreateDirectDto) {
    if (dto.peerUserId === userId) throw new BadRequestException('Cannot DM yourself');
    const peerId = dto.peerUserId;
    const peer = await this.prisma.user.findUnique({ where: { id: peerId } });
    if (!peer) throw new NotFoundException('User not found');

    const openDirectBetweenPair = async (tx: Prisma.TransactionClient): Promise<string | null> => {
      const existing = await tx.chat.findFirst({
        where: {
          type: ChatType.DIRECT,
          AND: [
            { members: { some: { userId, leftAt: null } } },
            { members: { some: { userId: peerId, leftAt: null } } },
          ],
        },
        include: { members: { where: { leftAt: null } } },
      });
      if (existing && existing.members.length === 2) return existing.id;
      return null;
    };

    const createInSerializableTx = async (): Promise<string> => {
      return this.prisma.$transaction(
        async (tx) => {
          const found = await openDirectBetweenPair(tx);
          if (found) return found;
          const chat = await tx.chat.create({
            data: {
              type: ChatType.DIRECT,
              createdById: userId,
              members: {
                create: [
                  { userId, role: MemberRole.MEMBER },
                  { userId: peerId, role: MemberRole.MEMBER },
                ],
              },
            },
          });
          return chat.id;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        },
      );
    };

    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const chatId = await createInSerializableTx();
        // If the user previously hid this direct chat, "reopening" it should make it visible again.
        // Fail open if the HiddenChat table hasn't been migrated yet.
        try {
          await this.prisma.hiddenChat.deleteMany({ where: { userId, chatId } });
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            (e.code === 'P2021' || e.code === 'P2022')
          ) {
            // Table/column missing (migration not applied) — ignore so DMs still work.
          } else {
            throw e;
          }
        }
        return this.getChatDetail(chatId, userId);
      } catch (e) {
        lastErr = e;
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') continue;
        throw e;
      }
    }
    throw lastErr;
  }

  async createGroup(userId: string, dto: CreateGroupDto) {
    const ids = [...new Set([userId, ...dto.memberUserIds])];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } } });
    if (users.length !== ids.length) throw new BadRequestException('Some users not found');

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.GROUP,
        title: dto.title,
        createdById: userId,
        groupMeta: { create: { description: dto.description ?? null } },
        members: {
          create: ids.map((uid) => ({
            userId: uid,
            role: uid === userId ? MemberRole.OWNER : MemberRole.MEMBER,
          })),
        },
      },
    });

    await this.prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: null,
        type: MessageType.SYSTEM,
        text: `Group "${dto.title}" was created`,
      },
    });

    return this.getChatDetail(chat.id, userId);
  }

  async createChannel(userId: string, dto: CreateChannelDto) {
    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.CHANNEL,
        title: dto.title,
        isPrivate: dto.isPrivate ?? false,
        createdById: userId,
        channelMeta: {
          create: {
            description: dto.description ?? null,
            handle: dto.handle?.toLowerCase() ?? null,
          },
        },
        members: {
          create: { userId, role: MemberRole.OWNER },
        },
      },
    });

    await this.prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: null,
        type: MessageType.SYSTEM,
        text: `Channel "${dto.title}" is live`,
      },
    });

    return this.getChatDetail(chat.id, userId);
  }

  async listForUser(userId: string, q?: string) {
    const memberships = await this.prisma.chatMember.findMany({
      where: { userId, leftAt: null },
      include: {
        chat: {
          include: {
            members: {
              where: { leftAt: null },
              include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
              },
            },
            messages: {
              where: {
                deletedAt: null,
                hiddenForUsers: { none: { userId } },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const pinned = await this.prisma.pinnedChat.findMany({
      where: { userId },
      select: { chatId: true, sortOrder: true },
    });
    const archived = await this.prisma.archivedChat.findMany({ where: { userId } });
    let hidden: { chatId: string }[] = [];
    try {
      hidden = await this.prisma.hiddenChat.findMany({
        where: { userId },
        select: { chatId: true },
      });
    } catch (e) {
      // If the migration hasn't been applied yet, do not blank the entire chat list.
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        (e.code === 'P2021' || e.code === 'P2022')
      ) {
        hidden = [];
      } else {
        throw e;
      }
    }
    const muted = await this.prisma.muteSetting.findMany({ where: { userId } });
    const readStates = await this.prisma.readState.findMany({ where: { userId } });

    const pinSet = new Set(pinned.map((p) => p.chatId));
    const pinOrder = new Map(pinned.map((p) => [p.chatId, p.sortOrder]));
    const archSet = new Set(archived.map((a) => a.chatId));
    const hiddenSet = new Set(hidden.map((h) => h.chatId));
    const muteMap = new Map(muted.map((m) => [m.chatId, m.mutedUntil]));
    const readMap = new Map(readStates.map((r) => [r.chatId, r]));

    const items = [];
    for (const m of memberships) {
      const c = m.chat;
      if (hiddenSet.has(c.id)) continue;
      const last = c.messages[0];
      const rs = readMap.get(c.id);
      const unread = await this.unreadCount(c.id, userId, rs?.lastReadMessageId ?? null);

      let title = c.title;
      let peer = null;
      if (c.type === ChatType.DIRECT) {
        const other = c.members.find((mem) => mem.userId !== userId)?.user;
        title = other?.displayName ?? other?.username ?? 'Direct';
        peer = other ?? null;
      }

      const ql = q?.trim().toLowerCase();
      if (ql) {
        const hay =
          `${title ?? ''} ${peer?.username ?? ''} ${peer?.displayName ?? ''}`.toLowerCase();
        if (!hay.includes(ql)) continue;
      }

      items.push({
        id: c.id,
        type: c.type,
        title,
        avatarUrl: c.avatarUrl,
        lastMessageAt: last?.createdAt?.toISOString() ?? c.updatedAt.toISOString(),
        lastMessagePreview: last?.deletedAt
          ? ''
          : (last?.text?.slice(0, 160) ?? (last ? '[Media]' : '')),
        unreadCount: unread,
        isPinned: pinSet.has(c.id),
        isArchived: archSet.has(c.id),
        isMuted: muteMap.has(c.id),
        pinOrder: pinOrder.get(c.id) ?? null,
        peer,
      });
    }

    items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isPinned && b.isPinned) {
        const ao = a.pinOrder ?? 0;
        const bo = b.pinOrder ?? 0;
        if (ao !== bo) return ao - bo;
      }
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return items;
  }

  private async unreadCount(chatId: string, userId: string, lastReadMessageId: string | null) {
    let after = new Date(0);
    if (lastReadMessageId) {
      const msg = await this.prisma.message.findUnique({ where: { id: lastReadMessageId } });
      if (msg) after = msg.createdAt;
    }
    return this.prisma.message.count({
      where: {
        chatId,
        deletedAt: null,
        senderId: { not: userId },
        createdAt: { gt: after },
        hiddenForUsers: { none: { userId } },
      },
    });
  }

  async getChatDetail(chatId: string, userId: string) {
    await this.assertMember(chatId, userId);
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        groupMeta: true,
        channelMeta: true,
        pinnedMessage: {
          include: {
            sender: { select: { id: true, username: true, displayName: true } },
          },
        },
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                lastSeenAt: true,
                shareLastSeen: true,
              },
            },
          },
        },
      },
    });
    if (!chat) throw new NotFoundException();

    const memberUsers = chat.members.map((m) => m.user);
    const presenceIds = [...new Set(memberUsers.map((u) => u.id))];
    const onlineMap = await this.presence.areUsersOnline(presenceIds);

    const mapMemberUser = (u: (typeof memberUsers)[number]) => {
      const showLast = u.id === userId || u.shareLastSeen;
      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        lastSeenAt: showLast && u.lastSeenAt ? u.lastSeenAt.toISOString() : null,
        lastSeenVisible: showLast,
        isOnline: Boolean(onlineMap[u.id]),
      };
    };

    let title = chat.title;
    let peer = null;
    if (chat.type === ChatType.DIRECT) {
      const other = chat.members.find((m) => m.userId !== userId)?.user;
      title = other?.displayName ?? other?.username ?? 'Direct';
      peer = other ? mapMemberUser(other) : null;
    }

    const me = chat.members.find((m) => m.userId === userId);
    return {
      id: chat.id,
      type: chat.type,
      title,
      avatarUrl: chat.avatarUrl,
      isPrivate: chat.isPrivate,
      role: me?.role,
      peer,
      group: chat.groupMeta,
      channel: chat.channelMeta,
      members: chat.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: mapMemberUser(m.user),
      })),
      pinnedMessage: chat.pinnedMessage
        ? {
            id: chat.pinnedMessage.id,
            text: chat.pinnedMessage.deletedAt ? null : chat.pinnedMessage.text,
            senderId: chat.pinnedMessage.senderId,
            createdAt: chat.pinnedMessage.createdAt.toISOString(),
            deletedAt: chat.pinnedMessage.deletedAt?.toISOString() ?? null,
            sender: chat.pinnedMessage.sender
              ? {
                  id: chat.pinnedMessage.sender.id,
                  username: chat.pinnedMessage.sender.username,
                  displayName: chat.pinnedMessage.sender.displayName,
                }
              : null,
          }
        : null,
    };
  }

  async pinMessage(userId: string, chatId: string, messageId: string | null) {
    await this.assertMember(chatId, userId);
    if (messageId) {
      const msg = await this.prisma.message.findFirst({
        where: { id: messageId, chatId },
        select: { id: true },
      });
      if (!msg) throw new BadRequestException('Invalid message');
    }
    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        pinnedMessageId: messageId,
        pinnedByUserId: messageId ? userId : null,
        pinnedAt: messageId ? new Date() : null,
      },
    });
    return { ok: true, pinnedMessageId: messageId };
  }

  async pin(userId: string, chatId: string, on: boolean) {
    await this.assertMember(chatId, userId);
    if (on) {
      const max = await this.prisma.pinnedChat.aggregate({
        where: { userId },
        _max: { sortOrder: true },
      });
      const nextOrder = (max._max.sortOrder ?? -1) + 1;
      await this.prisma.pinnedChat.upsert({
        where: { userId_chatId: { userId, chatId } },
        create: { userId, chatId, sortOrder: nextOrder },
        update: { sortOrder: nextOrder },
      });
    } else {
      await this.prisma.pinnedChat.deleteMany({ where: { userId, chatId } });
    }
    return { ok: true };
  }

  async reorderPinned(userId: string, chatIds: string[]) {
    const uniq = [...new Set(chatIds)].filter(Boolean);
    if (uniq.length === 0) return { ok: true };
    // Ensure user is a member of each chat and it's pinned.
    const pins = await this.prisma.pinnedChat.findMany({
      where: { userId, chatId: { in: uniq } },
      select: { chatId: true },
    });
    const pinnedSet = new Set(pins.map((p) => p.chatId));
    const toUpdate = uniq.filter((id) => pinnedSet.has(id));
    await this.prisma.$transaction(
      toUpdate.map((id, idx) =>
        this.prisma.pinnedChat.update({
          where: { userId_chatId: { userId, chatId: id } },
          data: { sortOrder: idx },
        }),
      ),
    );
    return { ok: true };
  }

  async archive(userId: string, chatId: string, on: boolean) {
    await this.assertMember(chatId, userId);
    if (on) {
      await this.prisma.archivedChat.upsert({
        where: { userId_chatId: { userId, chatId } },
        create: { userId, chatId },
        update: {},
      });
    } else {
      await this.prisma.archivedChat.deleteMany({ where: { userId, chatId } });
    }
    return { ok: true };
  }

  /** Hide chat from this user's list only; chat and messages remain; other members unaffected. */
  async hideFromList(userId: string, chatId: string) {
    await this.assertMember(chatId, userId);
    await this.prisma.$transaction([
      this.prisma.hiddenChat.upsert({
        where: { userId_chatId: { userId, chatId } },
        create: { userId, chatId },
        update: {},
      }),
      this.prisma.pinnedChat.deleteMany({ where: { userId, chatId } }),
      this.prisma.archivedChat.deleteMany({ where: { userId, chatId } }),
    ]);
    return { ok: true };
  }

  async mute(userId: string, chatId: string, until: Date | null) {
    await this.assertMember(chatId, userId);
    await this.prisma.muteSetting.upsert({
      where: { userId_chatId: { userId, chatId } },
      create: { userId, chatId, mutedUntil: until },
      update: { mutedUntil: until },
    });
    return { ok: true };
  }

  async updateChat(userId: string, chatId: string, dto: UpdateChatDto) {
    const m = await this.assertAdminOrOwner(chatId, userId);
    const chat = m.chat;
    if (chat.type === ChatType.DIRECT)
      throw new BadRequestException('Cannot rename direct chat here');

    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        title: dto.title,
        groupMeta:
          chat.type === ChatType.GROUP && dto.description !== undefined
            ? { update: { description: dto.description } }
            : undefined,
        channelMeta:
          chat.type === ChatType.CHANNEL && dto.description !== undefined
            ? { update: { description: dto.description } }
            : undefined,
      },
    });
    return this.getChatDetail(chatId, userId);
  }

  async addMember(userId: string, chatId: string, body: AddMemberDto) {
    const m = await this.assertAdminOrOwner(chatId, userId);
    const chat = m.chat;
    if (chat.type === ChatType.DIRECT) throw new BadRequestException('Use group/channel');
    const existing = await this.prisma.chatMember.findFirst({
      where: { chatId, userId: body.userId, leftAt: null },
    });
    if (existing) return this.getChatDetail(chatId, userId);

    const role =
      chat.type === ChatType.CHANNEL && body.role === MemberRole.SUBSCRIBER
        ? MemberRole.SUBSCRIBER
        : MemberRole.MEMBER;

    await this.prisma.chatMember.create({
      data: { chatId, userId: body.userId, role },
    });

    const joiner = await this.prisma.user.findUnique({ where: { id: body.userId } });
    await this.prisma.message.create({
      data: {
        chatId,
        senderId: null,
        type: MessageType.SYSTEM,
        text: `${joiner?.displayName ?? joiner?.username ?? 'Someone'} joined`,
      },
    });

    return this.getChatDetail(chatId, userId);
  }

  async removeMember(actorId: string, chatId: string, targetUserId: string) {
    const actor = await this.assertAdminOrOwner(chatId, actorId);
    if (targetUserId === actorId) throw new BadRequestException('Use leave endpoint');
    const target = await this.prisma.chatMember.findFirst({
      where: { chatId, userId: targetUserId, leftAt: null },
    });
    if (!target) throw new NotFoundException();
    if (target.role === MemberRole.OWNER) throw new ForbiddenException();

    await this.prisma.chatMember.update({
      where: { id: target.id },
      data: { leftAt: new Date() },
    });

    const u = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    await this.prisma.message.create({
      data: {
        chatId,
        senderId: null,
        type: MessageType.SYSTEM,
        text: `${u?.displayName ?? u?.username ?? 'Someone'} left`,
      },
    });

    return { ok: true };
  }

  async leave(userId: string, chatId: string) {
    const m = await this.assertMember(chatId, userId);
    if (m.role === MemberRole.OWNER) {
      const others = await this.prisma.chatMember.count({
        where: { chatId, leftAt: null, NOT: { userId } },
      });
      if (others > 0) throw new BadRequestException('Transfer ownership before leaving');
    }
    await this.prisma.chatMember.update({
      where: { id: m.id },
      data: { leftAt: new Date() },
    });
    return { ok: true };
  }

  async subscribePublicChannel(userId: string, channelId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: channelId, type: ChatType.CHANNEL, isPrivate: false },
    });
    if (!chat) throw new NotFoundException();
    const existing = await this.prisma.chatMember.findFirst({
      where: { chatId: channelId, userId, leftAt: null },
    });
    if (existing) return this.getChatDetail(channelId, userId);
    await this.prisma.chatMember.create({
      data: { chatId: channelId, userId, role: MemberRole.SUBSCRIBER },
    });
    return this.getChatDetail(channelId, userId);
  }
}
