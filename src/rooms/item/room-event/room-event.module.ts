import { forwardRef, Module } from '@nestjs/common';
import { RoomEventService } from './room-event.service';
import { RoomsModule } from 'src/rooms/rooms.module';
import { RoomSocketModule } from 'src/conversation-events/room-socket/room-socket.module';

@Module({
  imports: [forwardRef(() => RoomsModule), RoomSocketModule],
  controllers: [],
  providers: [RoomEventService],
  exports: [RoomEventService],
})
export class RoomEventModule {}
