import { forwardRef, Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { EventsHandlerModule } from './events-handler/events-handler.module';
import { ConversationEventsService } from './conversation-events.service';
import { RoomEventModule } from 'src/rooms/item/room-event/room-event.module';
import { RoomHandlerGateway } from './room-handler.gateway';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RoomsModule,
    forwardRef(() => EventsHandlerModule),
    RoomEventModule,
  ],
  controllers: [],
  providers: [
    ConversationEventsGateway,
    RoomHandlerGateway,
    ConversationEventsService,
  ],
  exports: [ConversationEventsGateway],
})
export class ConversationEventsModule {}
