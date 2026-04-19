import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportMessageDto {
  @ApiPropertyOptional({ description: 'Optional context from the reporter' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
