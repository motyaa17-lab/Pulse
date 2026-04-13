import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ReactionDto {
  @ApiProperty({ example: '👍' })
  @IsString()
  @MaxLength(16)
  emoji!: string;
}
