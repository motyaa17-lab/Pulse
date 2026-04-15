import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppGateway } from './ws.gateway';
import { WsService } from './ws.service';
import { ChatsModule } from '../chats/chats.module';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret_change_me',
      }),
    }),
    ChatsModule,
    forwardRef(() => MessagesModule),
    UsersModule,
  ],
  providers: [WsService, AppGateway],
  exports: [WsService],
})
export class WsModule {}
