import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  private isMissingDbTableError(e: unknown): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === 'P2021' || e.code === 'P2022')
    );
  }

  async list(userId: string) {
    try {
      const rows = await this.prisma.chatFolder.findMany({
        where: { userId },
        orderBy: { sortOrder: 'asc' },
        include: { chats: { select: { chatId: true } } },
      });
      return {
        items: rows.map((f) => ({
          id: f.id,
          title: f.title,
          sortOrder: f.sortOrder,
          chatIds: f.chats.map((c) => c.chatId),
        })),
      };
    } catch (e) {
      if (this.isMissingDbTableError(e)) {
        throw new ServiceUnavailableException(
          'Database is missing folders tables. Run: npm run prisma:migrate -w apps/server',
        );
      }
      throw e;
    }
  }

  async create(userId: string, title: string) {
    const t = title.trim();
    if (!t) throw new BadRequestException('Title required');
    const count = await this.prisma.chatFolder.count({ where: { userId } });
    const row = await this.prisma.chatFolder.create({
      data: { userId, title: t.slice(0, 48), sortOrder: count },
      include: { chats: { select: { chatId: true } } },
    });
    return { id: row.id, title: row.title, sortOrder: row.sortOrder, chatIds: [] as string[] };
  }

  async patch(userId: string, folderId: string, dto: { title?: string; sortOrder?: number }) {
    const folder = await this.prisma.chatFolder.findUnique({ where: { id: folderId } });
    if (!folder) throw new BadRequestException('Not found');
    if (folder.userId !== userId) throw new ForbiddenException();
    const next = await this.prisma.chatFolder.update({
      where: { id: folderId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim().slice(0, 48) } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: { chats: { select: { chatId: true } } },
    });
    return {
      id: next.id,
      title: next.title,
      sortOrder: next.sortOrder,
      chatIds: next.chats.map((c) => c.chatId),
    };
  }

  async setChats(userId: string, folderId: string, chatIds: string[]) {
    const folder = await this.prisma.chatFolder.findUnique({ where: { id: folderId } });
    if (!folder) throw new BadRequestException('Not found');
    if (folder.userId !== userId) throw new ForbiddenException();

    const ids = [...new Set(chatIds.map((x) => x.trim()).filter(Boolean))].slice(0, 500);

    // Ensure chats belong to the user (must be a member).
    const members = await this.prisma.chatMember.findMany({
      where: { userId, leftAt: null, chatId: { in: ids } },
      select: { chatId: true },
    });
    const allowed = new Set(members.map((m) => m.chatId));
    const finalIds = ids.filter((id) => allowed.has(id));

    await this.prisma.$transaction(async (tx) => {
      await tx.chatFolderChat.deleteMany({ where: { folderId } });
      if (finalIds.length > 0) {
        await tx.chatFolderChat.createMany({
          data: finalIds.map((chatId) => ({ folderId, chatId })),
          skipDuplicates: true,
        });
      }
    });

    return { ok: true };
  }
}
