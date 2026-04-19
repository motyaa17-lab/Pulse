import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PatchGroupSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onlyAdminsCanAddMembers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inviteEnabled?: boolean;
}
