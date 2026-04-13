import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { WsModule } from '../ws/ws.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ChatsModule, forwardRef(() => WsModule), UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
