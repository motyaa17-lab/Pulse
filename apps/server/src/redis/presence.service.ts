import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from './redis.tokens';

const ONLINE_TTL_SEC = 120;
const PRESENCE_KEY = (userId: string) => `presence:${userId}`;
const TYPING_KEY = (chatId: string) => `typing:${chatId}`;

@Injectable()
export class PresenceService {
  constructor(@Inject(REDIS) private readonly redis: Redis | null) {}

  // Fallback when Redis is disabled/unavailable (dev convenience).
  // Keeps typing indicators functional even without a Redis instance.
  private readonly typingMem = new Map<string, Map<string, number>>();

  private isDisabled(): boolean {
    return !this.redis;
  }

  async setOnline(userId: string): Promise<void> {
    if (this.isDisabled()) return;
    await this.redis!.set(PRESENCE_KEY(userId), '1', 'EX', ONLINE_TTL_SEC);
  }

  async refreshOnline(userId: string): Promise<void> {
    await this.setOnline(userId);
  }

  async setOffline(userId: string): Promise<void> {
    if (this.isDisabled()) return;
    await this.redis!.del(PRESENCE_KEY(userId));
  }

  async isUserOnline(userId: string): Promise<boolean> {
    if (this.isDisabled()) return false;
    const v = await this.redis!.get(PRESENCE_KEY(userId));
    return v === '1';
  }

  async areUsersOnline(userIds: string[]): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};
    if (this.isDisabled()) {
      const out: Record<string, boolean> = {};
      for (const id of userIds) out[id] = false;
      return out;
    }
    const pipe = this.redis!.pipeline();
    for (const id of userIds) pipe.exists(PRESENCE_KEY(id));
    const res = await pipe.exec();
    const out: Record<string, boolean> = {};
    userIds.forEach((id, i) => {
      const row = res?.[i];
      out[id] = Boolean(row && row[1] === 1);
    });
    return out;
  }

  async setTyping(chatId: string, userId: string, ttlSec = 6): Promise<void> {
    if (this.isDisabled()) {
      const key = TYPING_KEY(chatId);
      const m = this.typingMem.get(key) ?? new Map<string, number>();
      m.set(userId, Date.now());
      this.typingMem.set(key, m);
      // best-effort GC: drop empty maps on next clear/get
      return;
    }
    await this.redis!.hset(TYPING_KEY(chatId), userId, String(Date.now()));
    await this.redis!.expire(TYPING_KEY(chatId), ttlSec);
  }

  async clearTyping(chatId: string, userId: string): Promise<void> {
    if (this.isDisabled()) {
      const key = TYPING_KEY(chatId);
      const m = this.typingMem.get(key);
      if (!m) return;
      m.delete(userId);
      if (m.size === 0) this.typingMem.delete(key);
      return;
    }
    await this.redis!.hdel(TYPING_KEY(chatId), userId);
  }

  async getTypingUserIds(chatId: string, maxAgeMs = 5000): Promise<string[]> {
    if (this.isDisabled()) {
      const key = TYPING_KEY(chatId);
      const m = this.typingMem.get(key);
      if (!m) return [];
      const now = Date.now();
      for (const [uid, ts] of m.entries()) {
        if (now - ts >= maxAgeMs) m.delete(uid);
      }
      if (m.size === 0) this.typingMem.delete(key);
      return [...m.keys()];
    }
    const map = await this.redis!.hgetall(TYPING_KEY(chatId));
    const now = Date.now();
    return Object.entries(map)
      .filter(([, ts]) => now - Number(ts) < maxAgeMs)
      .map(([uid]) => uid);
  }
}
