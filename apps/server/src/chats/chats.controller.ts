import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { ChatsService } from './chats.service';
import { CreateDirectDto } from './dto/direct.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddMemberDto } from './dto/members.dto';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query('q') q?: string) {
    return this.chats.listForUser(user.sub, q);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.getChatDetail(id, user.sub);
  }

  @Post('direct')
  direct(@CurrentUser() user: JwtUser, @Body() dto: CreateDirectDto) {
    return this.chats.getOrCreateDirect(user.sub, dto);
  }

  @Post('groups')
  group(@CurrentUser() user: JwtUser, @Body() dto: CreateGroupDto) {
    return this.chats.createGroup(user.sub, dto);
  }

  @Post('channels')
  channel(@CurrentUser() user: JwtUser, @Body() dto: CreateChannelDto) {
    return this.chats.createChannel(user.sub, dto);
  }

  @Post('channels/:id/subscribe')
  subscribe(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.subscribePublicChannel(user.sub, id);
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.chats.updateChat(user.sub, id, dto);
  }

  @Post(':id/pin')
  pin(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body('on') on: boolean) {
    return this.chats.pin(user.sub, id, Boolean(on));
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body('on') on: boolean) {
    return this.chats.archive(user.sub, id, Boolean(on));
  }

  @Post(':id/mute')
  mute(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body('until') until?: string | null,
  ) {
    const d = until ? new Date(until) : null;
    return this.chats.mute(user.sub, id, d);
  }

  @Post(':id/members')
  addMember(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.chats.addMember(user.sub, id, dto);
  }

  @Post(':id/members/:userId/remove')
  removeMember(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.chats.removeMember(user.sub, id, targetUserId);
  }

  @Post(':id/leave')
  leave(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.leave(user.sub, id);
  }
}
