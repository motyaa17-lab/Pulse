import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentInputDto {
  @IsString()
  storageKey!: string;

  @IsString()
  kind!: string;

  @IsString()
  fileName!: string;

  @IsString()
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsString()
  url!: string;

  @IsOptional()
  durationSec?: number;

  @IsOptional()
  @IsString()
  waveformJson?: string;
}

export class CreateMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(16000)
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientTempId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replyToMessageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  forwardedFromMessageId?: string;

  @ApiPropertyOptional({ type: [AttachmentInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInputDto)
  attachments?: AttachmentInputDto[];
}
