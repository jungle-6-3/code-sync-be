import { Logger, UseFilters } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  initRoomSocket,
  RoomSocket,
  SocketStatus,
} from './interfaces/room-socket.interface';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/room';
import { ConversationEventsService } from './conversation-events.service';

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class ConversationEventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private roomsService: RoomsService,
    private conversationEventsService: ConversationEventsService,
  ) {}

  @WebSocketServer() server: Server;
  logger: Logger = new Logger('ConnectionAndDisconnectionEventGateway');

  afterInit(server: Server) {
    this.logger.log('Initialize Connectoin and Disconnection Gateway Done');
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.logger.log(`${client.id}로 부터 connection 요청`);
    let user: User;
    let room: Room;
    try {
      ({ user, room } = await this.conversationEventsService.getUserAndRoom(
        client.handshake,
      ));
      await this.conversationEventsService.setClientStatus(client, user, room);
    } catch (error) {
      // socket 연결에 실패하는 경우
      this.logger.log(
        `아래의 error로 인해 유저와 연결을 끊습니다 : ${client.id}`,
      );
      this.logger.debug((error as Error).stack);
      client.emit('exception', error.message);
      client.disconnect(true);
      return;
    }
    initRoomSocket(client, user, room);
    await this.conversationEventsService.joinClientInRoom(
      room,
      this.server,
      client,
    );

    this.logger.log(`연결된 Client id: ${client.id} status: ${client.status}`);
  }

  async handleDisconnect(client: RoomSocket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    if (client.status == undefined) {
      return;
    }
    this.logger.log(
      `${client.user.name}이 다음 상태에서 종료: ${client.status}`,
    );
    this.logger.log(`${client.room.uuid}에 속한 상태: ${client.room.status}`);
    await this.conversationEventsService.setClientDisconnect(
      this.server,
      client,
    );
  }
}
