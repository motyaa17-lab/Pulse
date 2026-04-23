import { IsArray, IsString, MaxLength } from 'class-validator';

export class ResolveUsersDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  ids!: string[];
}
