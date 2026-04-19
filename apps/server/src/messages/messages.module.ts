import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { WsModule } from '../ws/ws.module';
import { UsersModule } from '../users/users.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ChatsModule, forwardRef(() => WsModule), UsersModule, ReportsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
