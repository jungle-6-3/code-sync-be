import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { initRoomSocket, RoomSocket } from './interfaces/room-socket.interface';
import { RoomsService } from 'src/rooms/rooms.service';
import { Room, RoomStatus, RoomUser } from 'src/rooms/room';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';

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
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RoomEventGateway');

  @SubscribeMessage('invite-user')
  async handleInviteUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    this.logger.log(`invite-user from ${client.user}`);
    const roomUuid = client.roomUuid;
    if (!roomUuid) {
      throw new WsException('방장이 아니에요');
    }
    const room: Room = await this.roomsService.findRoombyUuid(roomUuid);
    const participantUser: RoomUser = room.watingUsers.find(
      (user) => user.email == email,
    );
    if (!participantUser) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    room.watingUsers.forEach((user) => {
      if (user.pk != participantUser.pk) {
        this.server.to(user.socketId).emit('invite-reject', {
          message: '초대 요청이 거절되었습니다',
        });
        // TODO: disconnect client
      }
    });
    room.watingUsers = [];

    room.participant = participantUser;
    this.server.to(participantUser.socketId).emit('invite-accepted', {
      message: '대화를 시작합니다.',
    });

    this.logger.log(`Now ${room.uuid} room is Running`);
    room.status = RoomStatus.RUNNING;
    return {
      sucess: true,
      message: '대화를 시작합니다.',
    };
  }

  afterInit(server: Server) {
    this.logger.log('Initialize WebSocket Server Done');
  }

  handleDisconnect(client: RoomSocket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    try {
      const cookie = client.handshake.headers.cookie;
      if (cookie == undefined) {
        throw new Error('로그인 하지 않았습니다');
      }
      const cookieMap = new URLSearchParams(cookie.replace(/; /g, '&'));
      const token: string = cookieMap.get('token');
      const payload: JwtPayloadDto = await this.authService.getUser(token);
      const user = await this.usersService.findUserbyPayload(payload);

      let roomUuid = client.handshake.query.roomUuid;
      if (Array.isArray(roomUuid)) {
        roomUuid = roomUuid[0];
      }
      const room: Room = await this.roomsService.findRoombyUuid(roomUuid);
      if (!room) {
        throw new Error('방이 존재하지 않습니다.');
      }
      if (room.status == RoomStatus.WATING) {
        if (room.creator.pk != user.pk) {
          throw new Error('방장이 입장하지 않습니다.');
        }
        room.status = RoomStatus.INVITING;
        room.creator.socketId = client.id;
        initRoomSocket(client, user, roomUuid);
      } else if (room.status == RoomStatus.INVITING) {
        if (room.creator.pk == user.pk) {
          throw new Error('당신이 방장입니다.');
        }
        const sameWaitingUser = room.watingUsers.find(
          (waiter) => waiter.pk == user.pk,
        );
        if (sameWaitingUser != undefined) {
          throw new Error('이미 참여 요청을 했습니다.');
        }

        const waitingUser = new RoomUser(client.user);
        waitingUser.socketId = client.id;
        room.watingUsers.push(waitingUser);
        initRoomSocket(client, user, roomUuid);

        this.server.to(room.uuid).emit('join-request-by', {
          message: '초대 요청이 왔습니다.',
          data: {
            participant: {
              user: user.name,
              email: user.email,
            },
          },
        });
      } else {
        throw new Error('이미 개최중이거나 종료중인 방입니다.');
      }
    } catch (error) {
      this.logger.log(`Not logined user : ${client.id}`);
      console.log(error);
      client.emit('exception', error);
      client.disconnect(true);
      return;
      // initRoomSocket(client, undefined, '');
    }

    this.logger.log(`Client Connected : ${client.id}`);
  }
}
