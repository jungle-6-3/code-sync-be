import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { RoomSocket } from '../interfaces/room-socket.interface';
import { Server } from 'socket.io';
import { CreateMessage } from '../dto/create-message';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class ChattingHandlerGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  logger = new Logger('ChattingEventGateway');

  afterInit(server: Server) {
    this.logger.log('Initalize Chatting Gateway Done');
  }

  @SubscribeMessage('chatting')
  handleMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() message: any,
  ) {
    // TODO :채팅이 끝나면 저장하는 기능
    this.handleChattingMessage(client, message);
    this.loggingMessage(client, message);
    const return_msg = this.messageDto(client, message);
    console.log(return_msg);

    return return_msg;
  }
  async handleChattingMessage(client: RoomSocket, message: any) {
    console.log('message:', message);
    client.broadcast.to(client.room.uuid).emit('chatting', {
      email: client.user.email,
      message: message.message,
      date: this.createDate(),
    });
  }
  // TODO: 메세지 로깅 구현 (시간, 발신자, 내용으로)
  async loggingMessage(client: RoomSocket, message: string) {
    const time = this.createDate();
    const name = client.user.name;
    const chat = { date: time, name, content: message };
    client.room.data.chat.addChat(chat);
  }

  messageDto(client: RoomSocket, message: string) {
    const time = this.createDate();
    const name = client.user.name;
    const content = message;

    const newMessage = new CreateMessage(time, name, content);
    return newMessage;
  }

  createDate() {
    const now = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return now;
  }
}
