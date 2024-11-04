import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ConversationEventsFilter } from './conversation-events.filter';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { ValidateUserIsCreatorPipe } from './pipes/validate-user-is-creator.pipe';
import {
  disconenctRoomSocket,
  RoomSocket,
  SocketStatus,
} from './interfaces/room-socket.interface';
import { Room } from 'src/rooms/item';
import { RoomStatus } from 'src/rooms/item/room-event';
import { Server } from 'socket.io';
import { RoomEventService } from 'src/rooms/item/room-event/room-event.service';

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class RoomHandlerGateway implements OnGatewayInit {
  constructor(private roomEventsService: RoomEventService) {}

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

    const participantSocket: RoomSocket = room.waitingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!participantSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    const disconnectSockets: RoomSocket[] = room.waitingSockets;
    room.waitingSockets = [];
    disconnectSockets.forEach((socket) => {
      if (socket != participantSocket) {
        disconenctRoomSocket(socket);
      }
    });

    await this.roomEventsService.runningRoomOnce(room, participantSocket);

    this.logger.log(`초대로 인해 ${room.uuid}의 상태가 Running이 되었습니다.`);

    participantSocket.emit('invite-accepted', {
      message: '대화를 시작합니다.',
      prUrl: room.prUrl,
      role: 'participant',
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
    const rejectedSocket: RoomSocket = room.waitingSockets.find(
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

  @UsePipes(ValidateUserIsCreatorPipe)
  @SubscribeMessage('close-room')
  async handleCloseRoom(@ConnectedSocket() client: RoomSocket) {
    const room = client.room;
    if (
      room.status == RoomStatus.WATING ||
      room.status == RoomStatus.INVITING
    ) {
      await this.roomEventsService.deleteRoom(room);
      return;
    }
    await this.roomEventsService.closeRoom(room);
    return;
  }
}
