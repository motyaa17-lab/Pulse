import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, q: string) {
    const query = q.trim();
    if (query.length < 2) {
      return { users: [], chats: [], messages: [] };
    }

    const users = await this.prisma.user.findMany({
      where: {
        NOT: { id: userId },
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        lastSeenAt: true,
      },
    });

    const memberships = await this.prisma.chatMember.findMany({
      where: { userId, leftAt: null },
      select: { chatId: true },
    });
    const chatIds = memberships.map((m) => m.chatId);

    const chats = await this.prisma.chat.findMany({
      where: {
        id: { in: chatIds },
        title: { contains: query, mode: 'insensitive' },
      },
      take: 20,
      select: { id: true, type: true, title: true, avatarUrl: true },
    });

    const messages = await this.prisma.message.findMany({
      where: {
        chatId: { in: chatIds },
        deletedAt: null,
        text: { contains: query, mode: 'insensitive' },
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        chatId: true,
        text: true,
        createdAt: true,
        senderId: true,
      },
    });

    return {
      users: users.map((u) => ({
        ...u,
        lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
      })),
      chats,
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }
}
