import { forwardRef, Module } from '@nestjs/common';
import { RoomEventService } from './room-event.service';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ServerJoinHandlerModule } from 'src/conversation-events/server-join-handler/server-join-handler.module';

@Module({
  imports: [forwardRef(() => RoomsModule), ServerJoinHandlerModule],
  controllers: [],
  providers: [RoomEventService],
  exports: [RoomEventService],
})
export class RoomEventModule {}
