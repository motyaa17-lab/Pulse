import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readdir, stat, unlink } from 'fs/promises';

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await listFilesRecursive(p)));
    } else if (e.isFile()) {
      out.push(p);
    }
  }
  return out;
}

@Injectable()
export class StorageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async usage(userId: string) {
    const [attachments, stories] = await Promise.all([
      this.prisma.messageAttachment.findMany({
        where: { message: { senderId: userId, deletedAt: null } },
        select: { sizeBytes: true },
      }),
      this.prisma.story.findMany({ where: { userId }, select: { sizeBytes: true } }),
    ]);

    return {
      attachmentsCount: attachments.length,
      attachmentsBytes: sum(attachments.map((a) => a.sizeBytes)),
      storiesCount: stories.length,
      storiesBytes: sum(stories.map((s) => s.sizeBytes)),
    };
  }

  /**
   * Telegram-like: clearing cache should not delete messages.
   * We only delete orphaned uploaded files on local disk that are not referenced by DB.
   * (No-op for S3 setups.)
   */
  async clearOrphanUploads(userId: string) {
    const s3 = this.config.get<string>('S3_ENDPOINT');
    if (s3) return { ok: true, deletedFiles: 0, deletedBytes: 0 };

    const uploadsRoot = join(process.cwd(), 'uploads');
    const userDir = join(uploadsRoot, userId);

    let files: string[] = [];
    try {
      files = await listFilesRecursive(userDir);
    } catch {
      return { ok: true, deletedFiles: 0, deletedBytes: 0 };
    }

    const [attachments, stories, me] = await Promise.all([
      this.prisma.messageAttachment.findMany({
        where: { message: { senderId: userId, deletedAt: null } },
        select: { storageKey: true },
      }),
      this.prisma.story.findMany({ where: { userId }, select: { storageKey: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } }),
    ]);

    const keep = new Set<string>();
    for (const a of attachments) keep.add(join(uploadsRoot, a.storageKey));
    for (const s of stories) keep.add(join(uploadsRoot, s.storageKey));
    if (me?.avatarUrl?.startsWith('/uploads/')) {
      const rel = me.avatarUrl.replace(/^\/uploads\//, '');
      keep.add(join(uploadsRoot, rel));
    }

    let deletedFiles = 0;
    let deletedBytes = 0;
    for (const f of files) {
      if (keep.has(f)) continue;
      try {
        const st = await stat(f);
        await unlink(f);
        deletedFiles += 1;
        deletedBytes += st.size;
      } catch {
        // ignore
      }
    }

    return { ok: true, deletedFiles, deletedBytes };
  }
}
