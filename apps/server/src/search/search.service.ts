import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  private messageSnippet(text: string, needle: string): string {
    const hay = text;
    const i = hay.toLowerCase().indexOf(needle.toLowerCase());
    if (i < 0) return hay.slice(0, 180);
    const before = 48;
    const after = 110;
    const start = Math.max(0, i - before);
    const end = Math.min(hay.length, i + needle.length + after);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < hay.length ? '…' : '';
    return `${prefix}${hay.slice(start, end)}${suffix}`;
  }

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
        shareLastSeen: true,
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
        hiddenForUsers: { none: { userId } },
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
      users: users.map((u) => {
        const show = u.shareLastSeen;
        const { shareLastSeen: _s, ...rest } = u;
        return {
          ...rest,
          lastSeenAt: show ? (u.lastSeenAt?.toISOString() ?? null) : null,
          lastSeenVisible: show,
        };
      }),
      chats,
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        snippet: m.text ? this.messageSnippet(m.text, query) : '',
      })),
    };
  }
}
