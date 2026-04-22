import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateChatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Public avatar URL (from /media/upload)' })
  @IsOptional()
  @IsString()
  // Allow data: URLs for environments without persistent object storage.
  @MaxLength(350000)
  avatarUrl?: string | null;
}
