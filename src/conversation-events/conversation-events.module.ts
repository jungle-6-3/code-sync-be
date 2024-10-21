import { Module } from '@nestjs/common';
import { ConversationEventsGateway } from './conversation-events.gateway';
import { ChattingGateway } from './events/chatting.gateway';
import { SharedDocGateway } from './events/shared-doc.gateway';
import { VoiceGateway } from './events/voice.gateway';

@Module({
  controllers: [],
  providers: [ConversationEventsGateway, ChattingGateway, SharedDocGateway, VoiceGateway],
})
export class ConversationEventsModule {}
