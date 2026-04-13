import { ForbiddenException } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatsService', () => {
  const prisma = {
    chatMember: { findFirst: jest.fn() },
  } as unknown as PrismaService;

  it('assertMember throws when not in chat', async () => {
    (prisma.chatMember.findFirst as jest.Mock).mockResolvedValue(null);
    const chats = new ChatsService(prisma);
    await expect(chats.assertMember('c1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
