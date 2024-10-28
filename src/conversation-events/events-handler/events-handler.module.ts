import { forwardRef, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { PeerJsService } from './peer-js.service';
import { ConversationEventsModule } from '../conversation-events.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { PeerJsGateway } from './peer-js.gateway';

@Module({
  imports: [
    forwardRef(() => ConversationEventsModule),
    AuthModule,
    UsersModule,
    RoomsModule,
  ],
  providers: [RoomService, PeerJsService, PeerJsGateway],
  exports: [RoomService, PeerJsService],
})
export class EventsHandlerModule {}
