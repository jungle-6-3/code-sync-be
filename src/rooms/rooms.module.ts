import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [UsersService],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
