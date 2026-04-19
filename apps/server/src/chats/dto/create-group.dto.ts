import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'When true, only admins/owner can add members (Telegram-style)',
  })
  @IsOptional()
  @IsBoolean()
  onlyAdminsCanAddMembers?: boolean;

  @ApiPropertyOptional({ description: 'Whether the invite link accepts new members' })
  @IsOptional()
  @IsBoolean()
  inviteEnabled?: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  memberUserIds!: string[];
}
