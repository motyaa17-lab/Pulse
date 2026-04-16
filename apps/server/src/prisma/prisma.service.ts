import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const isProd = process.env.NODE_ENV === 'production';

    // In production (Railway), a slow/unavailable DB should not prevent the HTTP server
    // from binding to PORT and answering liveness checks.
    if (isProd) {
      this.$connect()
        .then(() => this.logger.log('Prisma connected'))
        .catch((e) => this.logger.error(`Prisma connect failed (non-blocking): ${(e as Error).message}`));
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (e) {
      this.logger.error(`Prisma connect failed: ${(e as Error).message}`);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
