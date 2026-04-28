import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
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

  private async withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    const timeoutErr = new Error(`TIMEOUT:${label}`);
    const t = new Promise<never>((_, reject) => setTimeout(() => reject(timeoutErr), ms));
    try {
      return await Promise.race([p, t]);
    } catch (e) {
      if (e instanceof Error && e.message === `TIMEOUT:${label}`) {
        console.warn('[USERS TIMEOUT]', { label, ms });
        throw new ServiceUnavailableException('Upstream timeout');
      }
      throw e;
    }
  }

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
    const reqId = Math.random().toString(16).slice(2, 10);
    console.log('[ME FLOW] getById start', { reqId, id, viewerId });
    const user = await this.withTimeout(
      this.prisma.user.findUnique({
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
      }),
      5000,
      'prisma.user.findUnique(users/me)',
    );
    console.log('[ME FLOW] prisma done', { reqId, found: Boolean(user) });
    if (!user) throw new NotFoundException();
    console.log('[ME FLOW] presence start', { reqId });
    const online = await this.withTimeout(
      this.presence.isUserOnline(id),
      1500,
      'presence.isUserOnline(users/me)',
    );
    console.log('[ME FLOW] presence done', { reqId, online });
    if (viewerId !== id) {
      const { email: _e, shareLastSeen, role: _role, notificationPrefs: _np, ...publicUser } = user;
      const showSeen = shareLastSeen;
      const out = {
        ...publicUser,
        lastSeenAt: showSeen ? user.lastSeenAt : null,
        lastSeenVisible: showSeen,
        isOnline: online,
      };
      console.log('[ME FLOW] getById return public', { reqId });
      return out;
    }
    const out = { ...user, isOnline: online };
    console.log('[ME FLOW] getById return me', { reqId });
    return out;
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
