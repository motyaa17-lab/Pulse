import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    const disabled =
      process.env.DISABLE_DB === '1' ||
      process.env.DISABLE_DB === 'true' ||
      process.env.DISABLE_PRISMA === '1' ||
      process.env.DISABLE_PRISMA === 'true' ||
      !process.env.DATABASE_URL;

    if (disabled) {
      this.logger.warn('Prisma connection disabled (DISABLE_DB/DISABLE_PRISMA or missing DATABASE_URL)');
      return;
    }

    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Prisma connected');
    } catch (e) {
      this.connected = false;
      this.logger.warn(`Prisma connect failed (continuing without DB): ${(e as Error).message}`);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    try {
      await this.$disconnect();
    } catch {
      // ignore
    }
  }
}
