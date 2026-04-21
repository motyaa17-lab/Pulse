import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { FoldersService } from './folders.service';

class CreateFolderDto {
  @IsString()
  title!: string;
}

class PatchFolderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

class PatchFolderChatsDto {
  @IsArray()
  chatIds!: string[];
}

@ApiTags('folders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly folders: FoldersService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.folders.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateFolderDto) {
    return this.folders.create(user.sub, dto.title);
  }

  @Patch(':id')
  patch(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: PatchFolderDto) {
    return this.folders.patch(user.sub, id, dto);
  }

  @Post(':id/chats')
  setChats(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: PatchFolderChatsDto,
  ) {
    return this.folders.setChats(user.sub, id, dto.chatIds);
  }
}
