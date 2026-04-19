import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class JoinChannelDto {
  @ApiProperty({ description: 'Private invite token, @handle, full /join/c/… URL, or pasted link' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  slug!: string;
}
