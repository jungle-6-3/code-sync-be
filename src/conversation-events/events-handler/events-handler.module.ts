import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { PeerJsGateway } from './peer-js.gateway';
import { RoomGateway } from './room.gateway';
import { ChattingHandlerGateway } from './chatting-handler.gateway';

@Module({
  imports: [AuthModule, UsersModule, RoomsModule],
  providers: [PeerJsGateway, RoomGateway, ChattingHandlerGateway],
  exports: [],
})
export class EventsHandlerModule {}
