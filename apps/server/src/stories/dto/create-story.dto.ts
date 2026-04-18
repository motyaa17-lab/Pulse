import { IsInt, IsString, Min } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  storageKey!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  fileName!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsString()
  url!: string;
}
