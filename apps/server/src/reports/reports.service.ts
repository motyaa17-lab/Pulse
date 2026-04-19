import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ReportSource, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AUTO_REPORT_MIN_SCORE, scoreMessageSuspicion } from './suspicious-text';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createUserReport(chatId: string, messageId: string, reporterId: string, note?: string) {
    await this.prisma.chatMember.findFirstOrThrow({
      where: { chatId, userId: reporterId, leftAt: null },
    });

    const message = await this.prisma.message.findFirst({
      where: { id: messageId, chatId, deletedAt: null },
      select: { id: true, text: true },
    });
    if (!message) throw new NotFoundException('Message not found');

    const dup = await this.prisma.messageReport.findFirst({
      where: { messageId, reporterId, source: ReportSource.USER },
    });
    if (dup) throw new ConflictException('Already reported');

    const snapshot = (message.text ?? '').slice(0, 2000);

    return this.prisma.messageReport.create({
      data: {
        chatId,
        messageId,
        reporterId,
        source: ReportSource.USER,
        status: ReportStatus.OPEN,
        note: note?.trim() || null,
        textSnapshot: snapshot || null,
      },
    });
  }

  /** Called after a new message is stored; creates at most one open AUTOMATED row per message. */
  async maybeAutoReportFromNewMessage(chatId: string, messageId: string, text: string | null) {
    const { score, flags } = scoreMessageSuspicion(text);
    if (score < AUTO_REPORT_MIN_SCORE || flags.length === 0) return null;

    const open = await this.prisma.messageReport.findFirst({
      where: { messageId, source: ReportSource.AUTOMATED, status: ReportStatus.OPEN },
    });
    if (open) return open;

    const snapshot = (text ?? '').slice(0, 2000);

    return this.prisma.messageReport.create({
      data: {
        chatId,
        messageId,
        reporterId: null,
        source: ReportSource.AUTOMATED,
        status: ReportStatus.OPEN,
        flags: flags.join(','),
        textSnapshot: snapshot || null,
      },
    });
  }

  async listForAdmin(limit = 100) {
    return this.prisma.messageReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(200, Math.max(1, limit)),
      include: {
        reporter: { select: { id: true, username: true, email: true } },
      },
    });
  }
}
