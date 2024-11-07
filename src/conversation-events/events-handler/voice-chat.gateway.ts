import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ConversationEventsFilter } from '../conversation-events.filter';
import { UseFilters, UsePipes } from '@nestjs/common';
import { ValidateUserIsJoiningPipe } from '../pipes/validate-user-is-joining.pipe';
import { RoomSocket } from '../interfaces/room-socket.interface';
import { VoiceChat } from 'src/conversation-datas/data/voice-chatting';

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class VoiceChatGateway {
  @UsePipes(ValidateUserIsJoiningPipe)
  @SubscribeMessage('send-voice-text')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { date, message }: { date: Date; message: string },
  ) {
    const { room, user } = client;
    const voiceChat = room.data.voiceChat;
    const newChat = new VoiceChat(date, message, user);
    voiceChat.addChat(newChat);

    return {
      sucess: true,
      message: '음성 text를 받았습니다.',
    };
  }
}
