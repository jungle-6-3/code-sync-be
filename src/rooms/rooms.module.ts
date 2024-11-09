import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomEventModule } from './item/room-event/room-event.module';
import { UsersModule } from 'src/users/users.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';

@Module({
  imports: [UsersModule, RoomEventModule, ConversationsModule, OpenAiModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
