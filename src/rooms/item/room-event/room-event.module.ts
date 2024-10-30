import { forwardRef, Module } from '@nestjs/common';
import { RoomEventService } from './room-event.service';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [forwardRef(() => RoomsModule)],
  controllers: [],
  providers: [RoomEventService],
  exports: [RoomEventService],
})
export class RoomEventModule {}
