import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChatType, MemberRole } from '@prisma/client';

const BCRYPT_ROUNDS = 12;

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get accessSecret() {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret_change_me';
  }

  private accessExpires(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
  }

  private accessExpiresSeconds(): number {
    const raw = this.accessExpires();
    const m = raw.match(/^(\d+)([smhd])$/);
    if (!m) return 900;
    const n = Number(m[1]);
    const u = m[2];
    switch (u) {
      case 's':
        return n;
      case 'm':
        return n * 60;
      case 'h':
        return n * 3600;
      case 'd':
        return n * 86400;
      default:
        return 900;
    }
  }

  async register(dto: RegisterDto, meta: { userAgent?: string; ip?: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { username: dto.username.toLowerCase() }] },
    });
    if (existing) {
      throw new ConflictException('Email or username already in use');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username.toLowerCase(),
        displayName: dto.displayName ?? dto.username,
        passwordHash,
        notificationPrefs: { create: {} },
      },
    });

    await this.ensureSavedChat(user.id);

    return this.issueTokens(user.id, user.email, user.username, meta);
  }

  private async ensureSavedChat(userId: string) {
    const existing = await this.prisma.chat.findFirst({
      where: { type: ChatType.SAVED, members: { some: { userId, leftAt: null } } },
    });
    if (existing) return;
    await this.prisma.chat.create({
      data: {
        type: ChatType.SAVED,
        title: 'Saved',
        createdById: userId,
        members: {
          create: { userId, role: MemberRole.OWNER },
        },
      },
    });
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email, user.username, meta);
  }

  async refresh(refreshToken: string, meta: { userAgent?: string; ip?: string }) {
    const hash = hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash: hash, revokedAt: null },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(session.userId, session.user.email, session.user.username, meta);
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllExcept(userId: string, exceptSessionId: string) {
    await this.prisma.session.updateMany({
      where: { userId, id: { not: exceptSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    username: string,
    meta: { userAgent?: string; ip?: string },
  ) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, username },
      {
        secret: this.accessSecret,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.accessExpires() as any,
      },
    );

    const refreshRaw = randomBytes(48).toString('base64url');
    const refreshTokenHash = hashRefreshToken(refreshRaw);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
      },
    });

    return {
      accessToken,
      refreshToken: refreshRaw,
      expiresIn: this.accessExpiresSeconds(),
      sessionId: session.id,
    };
  }

  /** Used by WS handshake to bind socket to user + current session id if needed */
  async findSessionByRefresh(refreshToken: string) {
    const hash = hashRefreshToken(refreshToken);
    return this.prisma.session.findFirst({
      where: { refreshTokenHash: hash, revokedAt: null },
      include: { user: true },
    });
  }
}
