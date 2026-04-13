import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  async list(@CurrentUser() user: JwtUser, @Req() req: Request) {
    const rows = await this.prisma.session.findMany({
      where: { userId: user.sub, revokedAt: null },
      orderBy: { lastActiveAt: 'desc' },
    });
    const currentHashHeader = req.headers['x-session-fingerprint'] as string | undefined;
    return rows.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ip: s.ip,
      createdAt: s.createdAt.toISOString(),
      lastActiveAt: s.lastActiveAt.toISOString(),
      isCurrent: currentHashHeader ? s.id === currentHashHeader : false,
    }));
  }

  @Delete(':id')
  async revoke(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    await this.auth.revokeSession(user.sub, id);
    return { ok: true };
  }

  @Post('revoke-others')
  async revokeOthers(@CurrentUser() user: JwtUser, @Req() req: Request) {
    const currentId = req.headers['x-session-fingerprint'] as string | undefined;
    if (!currentId) return { ok: true, skipped: true };
    await this.auth.revokeAllExcept(user.sub, currentId);
    return { ok: true };
  }
}
