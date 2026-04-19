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
import { JoinGroupDto } from './dto/join-group.dto';
import { PatchGroupSettingsDto } from './dto/patch-group-settings.dto';
import { PatchChannelSettingsDto } from './dto/patch-channel-settings.dto';
import { JoinChannelDto } from './dto/join-channel.dto';
import { IsOptional, IsString } from 'class-validator';
import { IsArray } from 'class-validator';

class PinMessageDto {
  @IsOptional()
  @IsString()
  messageId?: string | null;
}

class ReorderPinnedDto {
  @IsArray()
  chatIds!: string[];
}

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

  @Get('discover/channels')
  discoverChannels(@CurrentUser() user: JwtUser, @Query('q') q?: string) {
    return this.chats.listDiscoverableChannels(user.sub, q);
  }

  @Post('join/group')
  joinGroup(@CurrentUser() user: JwtUser, @Body() dto: JoinGroupDto) {
    return this.chats.joinGroupByInvite(user.sub, dto.slug);
  }

  @Post('join/channel')
  joinChannel(@CurrentUser() user: JwtUser, @Body() dto: JoinChannelDto) {
    let slug = dto.slug.trim();
    const fromPath = slug.match(/\/join\/c\/([^/?#]+)/i);
    if (fromPath) slug = decodeURIComponent(fromPath[1]);
    return this.chats.joinChannelByInvite(user.sub, slug);
  }

  /** Must be registered before `:id` so `shared-media` is not parsed as a chat id. */
  @Get(':id/shared-media')
  sharedMedia(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const n = limit ? Number.parseInt(limit, 10) : 48;
    return this.chats.listSharedMedia(user.sub, id, Number.isFinite(n) ? n : 48);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.getChatDetail(id, user.sub);
  }

  @Patch(':id/group-settings')
  patchGroupSettings(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: PatchGroupSettingsDto,
  ) {
    return this.chats.updateGroupSettings(user.sub, id, dto);
  }

  @Post(':id/group/invite/rotate')
  rotateGroupInvite(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.rotateGroupInvite(user.sub, id);
  }

  @Patch(':id/channel-settings')
  patchChannelSettings(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: PatchChannelSettingsDto,
  ) {
    return this.chats.updateChannelSettings(user.sub, id, dto);
  }

  @Post(':id/channel/invite/rotate')
  rotateChannelInvite(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.rotateChannelInvite(user.sub, id);
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
  patch(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateChatDto) {
    return this.chats.updateChat(user.sub, id, dto);
  }

  @Post(':id/pin')
  pin(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body('on') on: boolean) {
    return this.chats.pin(user.sub, id, Boolean(on));
  }

  @Post('pins/reorder')
  reorderPins(@CurrentUser() user: JwtUser, @Body() dto: ReorderPinnedDto) {
    return this.chats.reorderPinned(user.sub, dto.chatIds ?? []);
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body('on') on: boolean) {
    return this.chats.archive(user.sub, id, Boolean(on));
  }

  @Post(':id/hide-from-list')
  hideFromList(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chats.hideFromList(user.sub, id);
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

  @Post(':id/pin-message')
  pinMessage(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: PinMessageDto) {
    return this.chats.pinMessage(user.sub, id, dto.messageId ?? null);
  }

  @Post(':id/members')
  addMember(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: AddMemberDto) {
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
