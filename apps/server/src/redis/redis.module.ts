import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS } from './redis.tokens';
import { PresenceService } from './presence.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const disabled =
          config.get<string>('DISABLE_REDIS') === '1' ||
          config.get<string>('DISABLE_REDIS') === 'true' ||
          !config.get<string>('REDIS_URL');

        if (disabled) return null;

        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const client = new Redis(url, {
          // Never let HTTP requests hang forever on Redis.
          // If Redis is down/unreachable, commands should fail fast and presence becomes a no-op.
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 2000,
          commandTimeout: 1500,
        });
        client.on('error', () => {
          // swallow: Redis is optional in dev without Docker
        });
        // Best-effort connect; presence will no-op if it never connects.
        client.connect().catch(() => void 0);
        return client;
      },
    },
    PresenceService,
  ],
  exports: [REDIS, PresenceService],
})
export class RedisModule {}
