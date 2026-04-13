import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class EditMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(16000)
  text!: string;
}
