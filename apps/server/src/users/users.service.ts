import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PresenceService } from '../redis/presence.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
  ) {}

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
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException();
    const online = await this.presence.isUserOnline(id);
    if (viewerId !== id) {
      const { email: _e, shareLastSeen, ...publicUser } = user;
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
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        username: dto.username?.toLowerCase(),
        avatarUrl: dto.avatarUrl === undefined ? undefined : dto.avatarUrl,
        shareLastSeen: dto.shareLastSeen === undefined ? undefined : dto.shareLastSeen,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        lastSeenAt: true,
        shareLastSeen: true,
        createdAt: true,
        updatedAt: true,
      },
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
}
