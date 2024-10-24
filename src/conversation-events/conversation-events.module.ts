import { Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [UsersModule, AuthModule, RoomsModule],
  controllers: [],
  providers: [ConversationEventsGateway],
})
export class ConversationEventsModule {}
