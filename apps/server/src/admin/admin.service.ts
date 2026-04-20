import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModerationActionType, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getReportDetail(reportId: string) {
    const report = await this.prisma.messageReport.findUnique({
      where: { id: reportId },
      include: {
        reporter: { select: { id: true, username: true, email: true } },
        message: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                mutedUntil: true,
                bannedUntil: true,
              },
            },
            attachments: true,
          },
        },
        chat: { select: { id: true, type: true, title: true } },
      },
    });
    if (!report) throw new NotFoundException('Report not found');

    const msg = report.message;
    const chatId = report.chatId;
    const pivot = msg?.createdAt ?? report.createdAt;

    const context = await this.prisma.message.findMany({
      where: { chatId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    // Provide a lightweight context window around the reported message time.
    const sortedAsc = [...context].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const idx = sortedAsc.findIndex((m) => m.id === report.messageId);
    const start = Math.max(0, (idx === -1 ? sortedAsc.length - 1 : idx) - 10);
    const end = Math.min(sortedAsc.length, idx === -1 ? sortedAsc.length : idx + 11);

    return {
      report,
      context: sortedAsc.slice(start, end),
    };
  }

  async setReportStatus(actorId: string, reportId: string, status: ReportStatus) {
    const updated = await this.prisma.messageReport.update({
      where: { id: reportId },
      data: { status },
    });
    await this.prisma.moderationAction.create({
      data: {
        actorId,
        reportId,
        messageId: updated.messageId,
        actionType:
          status === ReportStatus.CLOSED
            ? ModerationActionType.CLOSE_REPORT
            : ModerationActionType.REOPEN_REPORT,
      },
    });
    return updated;
  }

  async setReportNote(actorId: string, reportId: string, note: string | null) {
    const updated = await this.prisma.messageReport.update({
      where: { id: reportId },
      data: { note },
    });
    await this.prisma.moderationAction.create({
      data: {
        actorId,
        reportId,
        messageId: updated.messageId,
        actionType: ModerationActionType.NOTE_REPORT,
        reason: note?.slice(0, 240) ?? null,
      },
    });
    return updated;
  }

  async deleteMessage(actorId: string, messageId: string, reason?: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.deletedAt) return { ok: true };
    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
    await this.prisma.moderationAction.create({
      data: {
        actorId,
        messageId,
        targetUserId: msg.senderId ?? null,
        actionType: ModerationActionType.DELETE_MESSAGE,
        reason: reason?.slice(0, 240) ?? null,
      },
    });
    return { ok: true };
  }

  private untilDate(untilMinutes?: number): Date | null {
    if (untilMinutes == null) return null;
    if (!Number.isFinite(untilMinutes) || untilMinutes < 0) {
      throw new BadRequestException('Invalid untilMinutes');
    }
    if (untilMinutes === 0) return null;
    return new Date(Date.now() + untilMinutes * 60_000);
  }

  async setUserBan(actorId: string, userId: string, untilMinutes?: number, reason?: string) {
    const until = this.untilDate(untilMinutes);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        bannedUntil: until,
        bannedReason: until ? reason?.trim().slice(0, 240) || null : null,
      },
      select: { id: true, bannedUntil: true, bannedReason: true },
    });
    await this.prisma.moderationAction.create({
      data: {
        actorId,
        targetUserId: userId,
        actionType: until ? ModerationActionType.BAN_USER : ModerationActionType.UNBAN_USER,
        reason: reason?.trim().slice(0, 240) || null,
        metaJson: until ? JSON.stringify({ until: until.toISOString() }) : null,
      },
    });
    return updated;
  }

  async setUserMute(actorId: string, userId: string, untilMinutes?: number, reason?: string) {
    const until = this.untilDate(untilMinutes);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { mutedUntil: until, mutedReason: until ? reason?.trim().slice(0, 240) || null : null },
      select: { id: true, mutedUntil: true, mutedReason: true },
    });
    await this.prisma.moderationAction.create({
      data: {
        actorId,
        targetUserId: userId,
        actionType: until ? ModerationActionType.MUTE_USER : ModerationActionType.UNMUTE_USER,
        reason: reason?.trim().slice(0, 240) || null,
        metaJson: until ? JSON.stringify({ until: until.toISOString() }) : null,
      },
    });
    return updated;
  }

  async listAudit(limit = 100) {
    return this.prisma.moderationAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(200, Math.max(1, limit)),
      include: {
        actor: { select: { id: true, username: true, email: true, role: true } },
        targetUser: { select: { id: true, username: true, email: true, role: true } },
      },
    });
  }
}
