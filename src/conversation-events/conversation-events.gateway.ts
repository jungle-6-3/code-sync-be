import { Logger, UseFilters } from '@nestjs/common';
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

  @SubscribeMessage('share-peer-id')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { peerId }: { peerId: string },
  ) {
    // TODO check client is joining in room
    // TODO check room status is running
    const room = await this.roomsService.findRoombyUuid(client.roomUuid);
    this.server.to(room.uuid).emit('new-peer-id', {
      message: '화면 공유 요청이 왔습니다.',
      data: {
        email: client.user.email,
        peerId: peerId,
      },
    });
    return {
      sucess: true,
      message: 'Peer Id를 등록했습니다.',
    };
  }

  @SubscribeMessage('invite-user')
  async handleInviteUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    this.logger.log(`다음 유저로부터 초대 요청 ${client.user.name}`);
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
        client.disconnect(true);
      }
    });
    room.watingUsers = [];

    this.server.to(participantUser.socketId).socketsJoin(roomUuid);
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

  async handleDisconnect(client: RoomSocket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    const roomUuid = client.roomUuid;
    if (!roomUuid) {
      return;
    }
    const room = await this.roomsService.findRoombyUuid(roomUuid);
    if (room.creator.pk == client.user.pk) {
      // TODO 방에 있는 사람 모두 나게게 하기.
    } else if (room.participant.pk == client.user.pk) {
      // TODO 방 상태 바꾸기. participant 없애기.
    } else {
      // TODO watingUsers에 있던 case. 리스트에 있는 자기 자신을 없애야 함
    }
    this.roomsService.leaveRoom(client.user.pk);
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.logger.log(`${client.id}로 부터 connection 요청`);
    try {
      const cookie = client.handshake.headers.cookie;
      if (cookie == undefined) {
        throw new Error('로그인 하지 않았습니다');
      }
      const cookieMap = new URLSearchParams(cookie.replace(/; /g, '&'));
      const token: string = cookieMap.get('token');
      const payload: JwtPayloadDto = await this.authService.getUser(token);
      const user: User = await this.usersService.findUserbyPayload(payload);
      this.logger.log(`유저 정보 ${user.email} ${user.name}`);

      let roomUuid = client.handshake.query.roomUuid;
      this.logger.log(`room uuid 바꾸기 전 ${roomUuid}`);
      if (Array.isArray(roomUuid)) {
        roomUuid = roomUuid[0];
      }
      this.logger.log(`room uuid 바꾼 후 ${roomUuid}`);
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
        await this.roomsService.joinRoom(user.pk, room);
        client.join(roomUuid);
        initRoomSocket(client, user, roomUuid);
        this.logger.log('방장이 되었습니다.');
        this.logger.log(room);
      } else if (room.status == RoomStatus.INVITING) {
        if (room.creator.pk == user.pk) {
          throw new Error('당신이 방장입니다.');
        }
        const sameWaitingUser = room.watingUsers.find(
          (waiter) => waiter.pk == user.pk,
        );
        if (sameWaitingUser != undefined) {
          this.server.to(sameWaitingUser.socketId).disconnectSockets(true);
        }

        const waitingUser = new RoomUser(user);
        waitingUser.socketId = client.id;
        room.watingUsers.push(waitingUser);
        await this.roomsService.joinRoom(user.pk, room);
        initRoomSocket(client, user, roomUuid);
        this.logger.log('대기자에 추가되었습니다.');

        this.server.to(room.uuid).emit('join-request-by', {
          message: '초대 요청이 왔습니다.',
          data: {
            participant: {
              name: user.name,
              email: user.email,
            },
          },
        });
      } else {
        throw new Error('이미 개최중이거나 종료중인 방입니다.');
      }
    } catch (error) {
      this.logger.log(
        `아래의 error로 인해 유저와 연결을 끊습니다 : ${client.id}`,
      );
      this.logger.log(`${error}`);
      this.logger.log((error as Error).stack);
      client.emit('exception', error);
      client.disconnect(true);
      return;
      // initRoomSocket(client, undefined, '');
    }
    this.logger.log(`${client.roomUuid}`);
    this.logger.log(`Client Connected : ${client.id}`);
  }
}
