import { forwardRef, Module } from '@nestjs/common';
import { RoomHandlerService } from './room-handler.service';
import { PeerJsService } from './peer-js.service';
import { ConversationEventsModule } from '../conversation-events.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [
    forwardRef(() => ConversationEventsModule),
    AuthModule,
    UsersModule,
    RoomsModule,
  ],
  providers: [RoomHandlerService, PeerJsService],
  exports: [RoomHandlerService, PeerJsService],
})
export class EventsHandlerModule {}
