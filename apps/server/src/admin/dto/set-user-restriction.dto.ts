import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * untilMinutes: how long the restriction should last from now.
 * - Omit or 0 to clear.
 */
export class SetUserRestrictionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  untilMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  reason?: string;
}
