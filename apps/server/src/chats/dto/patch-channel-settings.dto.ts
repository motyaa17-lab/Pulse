import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchChannelSettingsDto {
  @ApiPropertyOptional({
    description: 'Public @handle (public channels only); empty string clears',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  handle?: string;

  @ApiPropertyOptional({ description: 'Private channel: allow joins via invite link' })
  @IsOptional()
  @IsBoolean()
  inviteEnabled?: boolean;
}
