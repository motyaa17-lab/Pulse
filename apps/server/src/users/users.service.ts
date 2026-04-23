import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ChatType, MemberRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PresenceService } from '../redis/presence.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

  async getOrCreateSavedChat(userId: string) {
    const existing = await this.prisma.chatMember.findFirst({
      where: { userId, leftAt: null, chat: { type: ChatType.SAVED } },
      select: { chatId: true },
    });
    if (existing) return { chatId: existing.chatId };

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.SAVED,
        title: 'Saved Messages',
        createdById: userId,
        members: {
          create: [{ userId, role: MemberRole.MEMBER }],
        },
      },
      select: { id: true },
    });
    return { chatId: chat.id };
  }

  async getById(id: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        lastSeenAt: true,
        shareLastSeen: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        notificationPrefs: {
          select: {
            soundEnabled: true,
            desktopEnabled: true,
            showPreview: true,
            mentionOnlyInChannels: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException();
    const online = await this.presence.isUserOnline(id);
    if (viewerId !== id) {
      const { email: _e, shareLastSeen, role: _role, notificationPrefs: _np, ...publicUser } = user;
      const showSeen = shareLastSeen;
      return {
        ...publicUser,
        lastSeenAt: showSeen ? user.lastSeenAt : null,
        lastSeenVisible: showSeen,
        isOnline: online,
      };
    }
    return { ...user, isOnline: online };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: dto.username.toLowerCase(), NOT: { id: userId } },
      });
      if (taken) throw new ConflictException('Username taken');
    }

    const notifTouched =
      dto.notificationSoundEnabled !== undefined ||
      dto.notificationDesktopEnabled !== undefined ||
      dto.notificationShowPreview !== undefined ||
      dto.notificationMentionOnlyInChannels !== undefined;

    if (notifTouched) {
      await this.prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          soundEnabled: dto.notificationSoundEnabled ?? true,
          desktopEnabled: dto.notificationDesktopEnabled ?? false,
          showPreview: dto.notificationShowPreview ?? true,
          mentionOnlyInChannels: dto.notificationMentionOnlyInChannels ?? false,
        },
        update: {
          ...(dto.notificationSoundEnabled !== undefined && {
            soundEnabled: dto.notificationSoundEnabled,
          }),
          ...(dto.notificationDesktopEnabled !== undefined && {
            desktopEnabled: dto.notificationDesktopEnabled,
          }),
          ...(dto.notificationShowPreview !== undefined && {
            showPreview: dto.notificationShowPreview,
          }),
          ...(dto.notificationMentionOnlyInChannels !== undefined && {
            mentionOnlyInChannels: dto.notificationMentionOnlyInChannels,
          }),
        },
      });
    }

    const meSelect = {
      id: true,
      email: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      lastSeenAt: true,
      shareLastSeen: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      notificationPrefs: {
        select: {
          soundEnabled: true,
          desktopEnabled: true,
          showPreview: true,
          mentionOnlyInChannels: true,
        },
      },
    } as const;

    const userPatch: Prisma.UserUpdateInput = {
      ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
      ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
      ...(dto.username !== undefined ? { username: dto.username.toLowerCase() } : {}),
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      ...(dto.shareLastSeen !== undefined ? { shareLastSeen: dto.shareLastSeen } : {}),
    };

    if (Object.keys(userPatch).length > 0) {
      return this.prisma.user.update({
        where: { id: userId },
        data: userPatch,
        select: meSelect,
      });
    }

    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: meSelect,
    });
  }

  async setAvatar(userId: string, url: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }

  async touchLastSeen(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  async resolveMany(ids: string[], viewerId: string) {
    const uniq = [...new Set((ids ?? []).filter(Boolean))].slice(0, 80);
    if (uniq.length === 0) return { items: [] };
    const rows = await this.prisma.user.findMany({
      where: { id: { in: uniq } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        lastSeenAt: true,
        shareLastSeen: true,
      },
    });
    const online = await this.presence.areUsersOnline(rows.map((r) => r.id));
    return {
      items: rows.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        isOnline: online[u.id] ?? false,
        lastSeenAt: u.shareLastSeen || u.id === viewerId ? u.lastSeenAt : null,
        lastSeenVisible: u.shareLastSeen || u.id === viewerId,
      })),
    };
  }
}
