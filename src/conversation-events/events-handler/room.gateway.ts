import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ConversationEventsFilter } from '../conversation-events.filter';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { ValidateUserIsCreatorPipe } from '../pipes/validate-user-is-creator.pipe';
import {
  disconenctRoomSocket,
  disconnectBeforeSocket,
  RoomSocket,
  SocketStatus,
} from '../interfaces/room-socket.interface';
import { Room, RoomStatus } from 'src/rooms/room';
import { Server } from 'socket.io';

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class RoomGateway implements OnGatewayInit {
  constructor() {}

  @WebSocketServer() server: Server;
  logger = new Logger('RoomEventGateway');

  afterInit(server: Server) {
    this.logger.log('Initialize Room Gateway Done');
  }

  @UsePipes(ValidateUserIsCreatorPipe)
  @SubscribeMessage('invite-user')
  async handleInviteUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    const room: Room = client.room;

    const participantSocket: RoomSocket = room.watingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!participantSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    const disconnectSockets: RoomSocket[] = room.watingSockets;
    room.watingSockets = [];
    disconnectSockets.forEach((socket) => {
      if (socket != participantSocket) {
        disconnectBeforeSocket(socket);
      }
    });

    participantSocket.status = SocketStatus.PARTICIPANT;
    participantSocket.join(room.uuid);
    room.participantSocket = participantSocket;
    room.status = RoomStatus.RUNNING;
    room.clearTimeout();
    this.logger.log(`Now ${room.uuid} room is Running`);

    participantSocket.emit('invite-accepted', {
      message: '대화를 시작합니다.',
      prUrl: room.prUrl,
    });

    return {
      sucess: true,
      message: '대화를 시작합니다.',
    };
  }

  @UsePipes(ValidateUserIsCreatorPipe)
  @SubscribeMessage('reject-user')
  async handleRejectUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    const room = client.room;
    const rejectedSocket: RoomSocket = room.watingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!rejectedSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    disconenctRoomSocket(rejectedSocket);

    return {
      sucess: true,
      message: '참가 요청을 거절했습니다.',
    };
  }
}
