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
import {
  reflashRoomSocket,
  initRoomSocket,
  RoomSocket,
  SocketStatus,
} from './interfaces/room-socket.interface';
import { RoomsService } from 'src/rooms/rooms.service';
import { Room, RoomStatus } from 'src/rooms/room';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';
import { EventListenerTypes } from 'typeorm/metadata/types/EventListenerTypes';

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
    private loggerService: ConversationEventsLoggerService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = this.loggerService.getLogger();

  // TODO: pipe로 creator나 participant인지 체크하도록 수정 필요.
  @SubscribeMessage('share-peer-id')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { peerId }: { peerId: string },
  ) {
    // TODO check client is joining in room
    // TODO check room status is running
    const room = client.room;
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

  // TODO: pipe로 방장인지 체크하도록 수정 필요.
  @SubscribeMessage('invite-user')
  async handleInviteUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    if (client.status == undefined) {
      this.logger.error(
        'invite-user에서 인증되지 않은 유저입니다. (일어나면 안 되는 일)',
      );
      throw new ConversationException(
        'AUTH_2',
        '인증되지 않은 유저입니다',
        true,
      );
    }
    this.logger.log(`다음 유저로부터 초대 요청 ${client.user.name}`);
    if (client.status != SocketStatus.CREATOR) {
      throw new WsException('방장이 아니에요');
    }
    const room = client.room;

    const participantSocket: RoomSocket = room.watingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!participantSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    room.watingSockets.forEach((socket) => {
      if (socket != participantSocket) {
        socket.emit('invite-reject', {
          message: '초대 요청이 거절되었습니다',
        });
        socket.disconnect(true);
      }
    });
    room.watingSockets = [];

    participantSocket.join(room.uuid);
    room.participantSocket = participantSocket;
    participantSocket.emit('invite-accepted', {
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
    if (client.status == undefined) {
      return;
    }
    if (client.status == SocketStatus.REFLASING) {
      return;
    }
    // TODO: type에 따라서 방의 상태도 바꾸기
    const room: Room = client.room;
    if (client.status == SocketStatus.CREATOR) {
    } else if (client.status == SocketStatus.WAITER) {
    } else if (client.status == SocketStatus.PARTICIPANT) {
    }
    this.roomsService.leaveRoom(client.user.pk);
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.logger.log(`${client.id}로 부터 connection 요청`);
    let afterInitSocketFuncion: Function;
    let user: User;
    let room: Room;
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
      if (Array.isArray(roomUuid)) {
        roomUuid = roomUuid[0];
      }
      this.logger.log(`받은 room uuid ${roomUuid}`);
      const room: Room = await this.roomsService.findRoombyUuid(roomUuid);
      if (!room) {
        throw new Error('방이 존재하지 않습니다.');
      }
      const beforeRoom = await this.roomsService.findRoombyPk(user.pk);
      // 다시 참여하는 경우
      if (beforeRoom) {
        if (beforeRoom.uuid != room.uuid) {
          throw new Error('이미 다른 방에 참가하거나 참가 신청을 했습니다.');
        }
        // TODO: bofore Socket을 room에서 찾는 logic 추가해야 함.
        const beforeSocket = undefined;
        reflashRoomSocket(beforeSocket, client);

        afterInitSocketFuncion = () => {};
      }
      // 방장이 입장하지 않은 방인 경우
      else if (room.status == RoomStatus.WATING) {
        if (room.creatorPk != user.pk) {
          throw new Error('방장이 입장하지 않습니다.');
        }

        afterInitSocketFuncion = () => {
          room.status = RoomStatus.INVITING;
          room.creatorSocket = client;
          client.join(roomUuid);
          this.logger.log('방장이 되었습니다.');
          this.logger.log(room);
        };
      }
      // 방장이 입장한 방인 경우
      else if (room.status == RoomStatus.INVITING) {
        if (room.creatorPk == user.pk) {
          this.logger.error('방장이 겹치는지 체크 했는데 뚫렸네요.');
          throw new Error('동시성 문제1: 백앤드를 불러주세요');
        }
        const sameWaitingUser = room.watingSockets.find(
          (waiter) => waiter.user.pk == user.pk,
        );
        if (sameWaitingUser != undefined) {
          this.logger.error('참여자가 겹치는지 체크 했는데 뚫렸네요.');
          throw new Error('동시성 문제2: 백앤드를 불러주세요');
        }

        afterInitSocketFuncion = () => {
          room.watingSockets.push(client);
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
        };
      } else {
        throw new Error('이미 개최중이거나 종료중인 방입니다.');
      }
    } catch (error) {
      // socket 연결에 실패하는 경우
      this.logger.log(
        `아래의 error로 인해 유저와 연결을 끊습니다 : ${client.id}`,
      );
      this.logger.log(`${error}`);
      this.logger.log((error as Error).stack);
      client.emit('exception', error);
      client.disconnect(true);
      return;
    }
    initRoomSocket(client, user, room);
    await this.roomsService.joinRoom(room, user.pk);
    afterInitSocketFuncion();

    this.logger.log(`${client.room}`);
    this.logger.log(`Client Connected : ${client.id}`);
  }
}
