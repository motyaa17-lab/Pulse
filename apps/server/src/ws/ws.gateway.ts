import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { WsService } from './ws.service';
import { PresenceService } from '../redis/presence.service';
import { ChatsService } from '../chats/chats.service';
import { MessagesService } from '../messages/messages.service';

type HandshakeAuth = { token?: string };

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly ws: WsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly presence: PresenceService,
    private readonly chats: ChatsService,
    private readonly messages: MessagesService,
  ) {}

  afterInit() {
    this.ws.attachServer(this.server);
    const redisDisabled =
      this.config.get<string>('DISABLE_REDIS') === '1' ||
      this.config.get<string>('DISABLE_REDIS') === 'true' ||
      !this.config.get<string>('REDIS_URL');
    if (redisDisabled) {
      this.logger.log('Socket.IO Redis adapter disabled');
      return;
    }

    const redisUrl = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    try {
      const pub = new Redis(redisUrl, { lazyConnect: true });
      const sub = pub.duplicate();
      pub.on('error', () => void 0);
      sub.on('error', () => void 0);
      Promise.all([pub.connect(), sub.connect()]).catch(() => void 0);
      this.server.adapter(createAdapter(pub, sub));
      this.logger.log('Socket.IO Redis adapter enabled');
    } catch (e) {
      this.logger.warn(`Redis adapter skipped: ${(e as Error).message}`);
    }
  }

  private verifyClient(client: Socket): { sub: string } {
    const auth = client.handshake.auth as HandshakeAuth;
    const header = client.handshake.headers.authorization;
    const raw =
      auth?.token ??
      (typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7)
        : null);
    if (!raw) throw new UnauthorizedException();
    const secret = this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret_change_me';
    const payload = this.jwt.verify<{ sub: string }>(raw, { secret });
    if (!payload?.sub) throw new UnauthorizedException();
    return payload;
  }

  async handleConnection(client: Socket) {
    try {
      const { sub } = this.verifyClient(client);
      (client.data as { userId: string }).userId = sub;
      await this.presence.setOnline(sub);
      await client.join(`user:${sub}`);
      this.server.emit('presence:update', { userId: sub, online: true });
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client.data as { userId?: string }).userId;
    if (userId) {
      await this.presence.setOffline(userId);
      this.server.emit('presence:update', { userId, online: false });
    }
  }

  @SubscribeMessage('chat:join')
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() body: { chatId: string }) {
    const userId = (client.data as { userId: string }).userId;
    await this.chats.assertMember(body.chatId, userId);
    await client.join(`chat:${body.chatId}`);
    return { ok: true };
  }

  @SubscribeMessage('chat:leave')
  async onLeave(@ConnectedSocket() client: Socket, @MessageBody() body: { chatId: string }) {
    await client.leave(`chat:${body.chatId}`);
    return { ok: true };
  }

  @SubscribeMessage('message:typing')
  async onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; typing: boolean },
  ) {
    const userId = (client.data as { userId: string }).userId;
    await this.chats.assertMember(body.chatId, userId);
    if (body.typing) await this.presence.setTyping(body.chatId, userId);
    else await this.presence.clearTyping(body.chatId, userId);
    const ids = await this.presence.getTypingUserIds(body.chatId);
    this.ws.emitToChat(body.chatId, 'typing:update', { chatId: body.chatId, userIds: ids });
    return { ok: true };
  }

  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; messageId: string },
  ) {
    const userId = (client.data as { userId: string }).userId;
    await this.messages.markRead(userId, body.chatId, body.messageId);
    return { ok: true };
  }

  @SubscribeMessage('reaction:add')
  async onReactionAdd(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; messageId: string; emoji: string },
  ) {
    const userId = (client.data as { userId: string }).userId;
    await this.messages.addReaction(userId, body.chatId, body.messageId, body.emoji);
    return { ok: true };
  }

  @SubscribeMessage('reaction:remove')
  async onReactionRemove(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chatId: string; messageId: string; emoji: string },
  ) {
    const userId = (client.data as { userId: string }).userId;
    await this.messages.removeReaction(userId, body.chatId, body.messageId, body.emoji);
    return { ok: true };
  }

  @SubscribeMessage('presence:ping')
  async onPing(@ConnectedSocket() client: Socket) {
    const userId = (client.data as { userId: string }).userId;
    await this.presence.refreshOnline(userId);
    return { ok: true };
  }
}
