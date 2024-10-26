import { forwardRef, Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { EventsHandlerModule } from './events-handler/events-handler.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RoomsModule,
    forwardRef(() => EventsHandlerModule),
  ],
  controllers: [],
  providers: [ConversationEventsGateway],
  exports: [ConversationEventsGateway],
})
export class ConversationEventsModule {}
