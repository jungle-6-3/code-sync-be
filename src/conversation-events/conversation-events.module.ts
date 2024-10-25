import { Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { RoomEventsHandlerService } from './services/room-events-handler.service';
import { ConversationEventsLoggerService } from './services/conversation-events-logger.service';
import { PeerJsEventsHandlerService } from './services/peer-js-events-handler.service';

@Module({
  imports: [UsersModule, AuthModule, RoomsModule],
  controllers: [],
  providers: [
    ConversationEventsGateway,
    RoomEventsHandlerService,
    ConversationEventsLoggerService,
    PeerJsEventsHandlerService,
  ],
})
export class ConversationEventsModule {}
