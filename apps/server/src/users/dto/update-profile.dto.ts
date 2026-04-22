import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Change handle (unique)' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9_]+$/i)
  username?: string;

  @ApiPropertyOptional({ description: 'Public avatar URL (from /media/upload)' })
  @IsOptional()
  @IsString()
  // Allow data: URLs for environments without persistent object storage.
  @MaxLength(350000)
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Whether other users can see your last seen time' })
  @IsOptional()
  @IsBoolean()
  shareLastSeen?: boolean;

  @ApiPropertyOptional({ description: 'Play UI sounds for sends/receives (synced across devices)' })
  @IsOptional()
  @IsBoolean()
  notificationSoundEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Browser desktop notifications for new messages' })
  @IsOptional()
  @IsBoolean()
  notificationDesktopEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Show message text inside desktop notifications' })
  @IsOptional()
  @IsBoolean()
  notificationShowPreview?: boolean;

  @ApiPropertyOptional({
    description: 'In channels, only notify when message likely contains a mention (client hint)',
  })
  @IsOptional()
  @IsBoolean()
  notificationMentionOnlyInChannels?: boolean;
}
