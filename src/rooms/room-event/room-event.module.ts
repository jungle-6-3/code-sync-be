import { forwardRef, Module } from '@nestjs/common';
import { RoomEventService } from './room-event.service';
import { RoomsModule } from 'src/rooms/rooms.module';
import { RoomSocketModule } from 'src/conversation-events/room-socket/room-socket.module';
import { RoomEventTimerService } from './room-event.timer.service';

@Module({
  imports: [forwardRef(() => RoomsModule), RoomSocketModule],
  controllers: [],
  providers: [RoomEventService, RoomEventTimerService],
  exports: [RoomEventService, RoomEventTimerService],
})
export class RoomEventModule {}
