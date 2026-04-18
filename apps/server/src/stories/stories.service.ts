import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async peerUserIdsForStories(viewerId: string): Promise<string[]> {
    const directChats = await this.prisma.chat.findMany({
      where: {
        type: ChatType.DIRECT,
        members: { some: { userId: viewerId, leftAt: null } },
      },
      include: {
        members: {
          where: { leftAt: null },
          select: { userId: true },
        },
      },
    });
    const ids = new Set<string>([viewerId]);
    for (const c of directChats) {
      for (const m of c.members) {
        ids.add(m.userId);
      }
    }
    return [...ids];
  }

  async feed(viewerId: string) {
    const now = new Date();
    const userIds = await this.peerUserIdsForStories(viewerId);
    const rows = await this.prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    const latestByUser = new Map<string, (typeof rows)[0]>();
    for (const s of rows) {
      if (!latestByUser.has(s.userId)) latestByUser.set(s.userId, s);
    }
    const items = [...latestByUser.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return {
      items: items.map((s) => ({
        id: s.id,
        userId: s.userId,
        mimeType: s.mimeType,
        url: s.url,
        fileName: s.fileName,
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        user: s.user,
      })),
    };
  }

  async create(
    userId: string,
    dto: { storageKey: string; mimeType: string; fileName: string; sizeBytes: number; url: string },
  ) {
    if (!dto.storageKey.startsWith(`${userId}/`)) {
      throw new ForbiddenException('Invalid storage key for this user');
    }
    const img = dto.mimeType.startsWith('image/');
    const vid = dto.mimeType.startsWith('video/');
    if (!img && !vid) {
      throw new BadRequestException('Stories support photo or video only');
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + STORY_TTL_MS);
    const story = await this.prisma.story.create({
      data: {
        userId,
        storageKey: dto.storageKey,
        mimeType: dto.mimeType,
        fileName: dto.fileName,
        sizeBytes: dto.sizeBytes,
        url: dto.url,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
    return {
      id: story.id,
      userId: story.userId,
      mimeType: story.mimeType,
      url: story.url,
      fileName: story.fileName,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
      user: story.user,
    };
  }

  async remove(userId: string, storyId: string) {
    const s = await this.prisma.story.findUnique({ where: { id: storyId } });
    if (!s) throw new NotFoundException('Story not found');
    if (s.userId !== userId) throw new ForbiddenException();
    await this.prisma.story.delete({ where: { id: storyId } });
    return { ok: true };
  }
}
