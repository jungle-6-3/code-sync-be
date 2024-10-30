import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { UsersModule } from 'src/users/users.module';
import { RoomEventsService } from './room-events.service';

@Module({
  imports: [UsersModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomEventsService],
  exports: [RoomsService],
})
export class RoomsModule {}
