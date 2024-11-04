import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { RoomSocket } from '../interfaces/room-socket.interface';
import { Server } from 'socket.io';
import { MessageResponseDto } from '../dto/message-response.dto';
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
    if (
      message == null ||
      message == undefined ||
      message.message == null ||
      message.message == undefined
    ) {
      throw new WsException('메시지에 값이 없습니다.');
    }

    const msg = message.message;
    const return_msg = new MessageResponseDto(
      client.user.name,
      msg,
      client.user.email,
    );
    this.handleChattingMessage(client, return_msg);
    this.loggingMessage(client, return_msg);

    return return_msg;
  }
  async handleChattingMessage(client: RoomSocket, message: MessageResponseDto) {
    client.broadcast.to(client.room.uuid).emit('chatting', message);
  }
  async loggingMessage(client: RoomSocket, message: MessageResponseDto) {
    client.room.data.chat.addChat(message);
  }
}
