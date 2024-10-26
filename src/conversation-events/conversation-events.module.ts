import { forwardRef, Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { RoomEventsHandlerService } from './services/room-events-handler.service';
import { ConversationEventsLoggerService } from './services/conversation-events-logger.service';
import { PeerJsEventsHandlerService } from './services/peer-js-events-handler.service';
import { EventsHandlerModule } from './events-handler/events-handler.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RoomsModule,
    forwardRef(() => EventsHandlerModule),
  ],
  controllers: [],
  providers: [
    ConversationEventsGateway,
    RoomEventsHandlerService,
    ConversationEventsLoggerService,
    PeerJsEventsHandlerService,
  ],
  exports: [ConversationEventsGateway],
})
export class ConversationEventsModule {}
