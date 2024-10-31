import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomEventModule } from './room-event/room-event.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, RoomEventModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
