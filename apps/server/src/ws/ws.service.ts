import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class WsService {
  private server: Server | null = null;

  attachServer(server: Server) {
    this.server = server;
  }

  emitToChat(chatId: string, event: string, payload: unknown) {
    this.server?.to(`chat:${chatId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  emitToUsers(userIds: string[], event: string, payload: unknown) {
    const uniq = [...new Set(userIds)];
    for (const id of uniq) this.emitToUser(id, event, payload);
  }
}
