import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({ description: 'Invite token from the group invite link' })
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  slug!: string;
}
