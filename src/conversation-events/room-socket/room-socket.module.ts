import { Module } from '@nestjs/common';
import { RoomSocketService } from './room-socket.service';

@Module({
  providers: [RoomSocketService],
})
export class RoomSocketModule {}
