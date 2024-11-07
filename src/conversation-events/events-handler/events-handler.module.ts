import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PeerJsGateway } from './peer-js.gateway';
import { ChattingHandlerGateway } from './chatting-handler.gateway';
import { RoomEventModule } from 'src/rooms/item/room-event/room-event.module';
import { VoiceChatGateway } from './voice-chat.gateway';

@Module({
  imports: [AuthModule, UsersModule, RoomEventModule],
  providers: [PeerJsGateway, ChattingHandlerGateway, VoiceChatGateway],
  exports: [],
})
export class EventsHandlerModule {}
