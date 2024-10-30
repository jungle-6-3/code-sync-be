import { Module } from '@nestjs/common';
import { RoomSocketService } from './room-socket.service';

@Module({
  providers: [RoomSocketService],
  exports: [RoomSocketService],
})
export class RoomSocketModule {}
