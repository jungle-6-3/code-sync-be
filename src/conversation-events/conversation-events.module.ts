import { Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { ChattingGateway } from './events/chatting.gateway';
import { SharedDocGateway } from './events/shared-doc.gateway';
import { VoiceGateway } from './events/voice.gateway';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [UsersModule, AuthModule, RoomsModule],
  controllers: [],
  providers: [
    ConversationEventsGateway,
    ChattingGateway,
    SharedDocGateway,
    VoiceGateway,
  ],
})
export class ConversationEventsModule {}
