import { Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ConversationEventsService } from './conversation-events.service';
import { RoomEventModule } from 'src/rooms/item/room-event/room-event.module';
import { RoomSocketModule } from './room-socket/room-socket.module';
import { SocketInformationModule } from './socket-information/socket-information.module';

@Module({
  imports: [UsersModule, AuthModule, RoomsModule, RoomEventModule, RoomSocketModule, SocketInformationModule],
  providers: [ConversationEventsGateway, ConversationEventsService],
})
export class ConversationEventsModule {}
