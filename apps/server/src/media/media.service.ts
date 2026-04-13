import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = new Map<string, string[]>([
  ['image', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']],
  ['video', ['video/mp4', 'video/webm', 'video/quicktime']],
  ['voice', ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4']],
  ['file', []],
]);

@Injectable()
export class MediaService {
  private s3: S3Client | null = null;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    if (endpoint) {
      this.s3 = new S3Client({
        region: this.config.get<string>('S3_REGION') ?? 'us-east-1',
        endpoint,
        forcePathStyle: this.config.get<string>('S3_FORCE_PATH_STYLE') === 'true',
        credentials: {
          accessKeyId: this.config.get<string>('S3_ACCESS_KEY') ?? '',
          secretAccessKey: this.config.get<string>('S3_SECRET_KEY') ?? '',
        },
      });
    }
  }

  private assertMime(kind: string, mime: string) {
    const list = ALLOWED.get(kind);
    if (kind === 'file') return;
    if (!list?.includes(mime)) {
      throw new BadRequestException(`Unsupported mime for ${kind}`);
    }
  }

  async saveUploaded(
    userId: string,
    file: Express.Multer.File,
    kind: 'image' | 'video' | 'voice' | 'file',
  ) {
    if (!file?.buffer?.length) throw new BadRequestException('No file');
    if (file.size > MAX_BYTES) throw new BadRequestException('File too large');
    this.assertMime(kind, file.mimetype);

    const ext = this.extFromMime(file.originalname, file.mimetype);
    const storageKey = `${userId}/${randomUUID()}${ext}`;

    if (this.s3) {
      const bucket = this.config.get<string>('S3_BUCKET') ?? 'pulse-media';
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: storageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      const base = this.config.get<string>('S3_PUBLIC_BASE_URL') ?? '';
      const url = `${base.replace(/\/$/, '')}/${storageKey}`;
      return {
        storageKey,
        url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        kind,
      };
    }

    const root = join(process.cwd(), 'uploads');
    await mkdir(join(root, userId), { recursive: true });
    const diskPath = join(root, storageKey);
    await writeFile(diskPath, file.buffer);
    const port = this.config.get<string>('PORT') ?? '4000';
    const url = `http://localhost:${port}/uploads/${storageKey.replace(/\\/g, '/')}`;
    return {
      storageKey,
      url,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      kind,
    };
  }

  private extFromMime(name: string, mime: string) {
    const dot = name.lastIndexOf('.');
    if (dot >= 0) return name.slice(dot);
    if (mime === 'image/jpeg') return '.jpg';
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'video/mp4') return '.mp4';
    if (mime === 'audio/webm') return '.webm';
    return '';
  }
}
