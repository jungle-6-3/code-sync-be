import { forwardRef, Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { EventsHandlerModule } from './events-handler/events-handler.module';
import { ConversationEventsService } from './conversation-events.service';
import { RoomEventModule } from 'src/rooms/item/room-event/room-event.module';
import { ServerJoinHandlerModule } from './server-join-handler/server-join-handler.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RoomsModule,
    forwardRef(() => EventsHandlerModule),
    RoomEventModule,
    ServerJoinHandlerModule,
  ],
  controllers: [],
  providers: [ConversationEventsGateway, ConversationEventsService],
  exports: [ConversationEventsGateway],
})
export class ConversationEventsModule {}
