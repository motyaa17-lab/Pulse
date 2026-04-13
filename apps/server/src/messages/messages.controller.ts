import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { ReactionDto } from './dto/reaction.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats/:chatId/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.messages.list(chatId, user.sub, cursor, take ? Number(take) : 40);
  }

  @Post()
  create(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messages.create(user.sub, chatId, dto);
  }

  @Patch(':messageId')
  edit(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messages.edit(user.sub, chatId, messageId, dto);
  }

  @Delete(':messageId')
  remove(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messages.softDelete(user.sub, chatId, messageId);
  }

  @Post(':messageId/reactions')
  addReaction(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() dto: ReactionDto,
  ) {
    return this.messages.addReaction(user.sub, chatId, messageId, dto.emoji);
  }

  @Delete(':messageId/reactions')
  removeReaction(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Query('emoji') emoji: string,
  ) {
    return this.messages.removeReaction(user.sub, chatId, messageId, emoji);
  }

  @Post(':messageId/read')
  read(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messages.markRead(user.sub, chatId, messageId);
  }

  @Post(':messageId/delivered')
  delivered(
    @CurrentUser() user: JwtUser,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messages.markDelivered(user.sub, chatId, messageId);
  }
}
