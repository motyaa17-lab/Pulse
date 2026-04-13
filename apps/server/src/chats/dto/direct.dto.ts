import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDirectDto {
  @ApiProperty()
  @IsString()
  peerUserId!: string;
}
