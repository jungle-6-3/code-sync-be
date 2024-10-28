import { forwardRef, Inject, Logger, UseFilters } from '@nestjs/common';
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
  copyFromBeforeSocket,
  disconnectBeforeSocket,
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
import { Handshake } from 'socket.io/dist/socket-types';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { RoomsService } from 'src/rooms/rooms.service';
import { User } from 'src/users/entities/user.entity';
import { Room, RoomStatus } from 'src/rooms/room';

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
  logger: Logger = new Logger('ConnectionAndDisconnectionEventGateway');

  afterInit(server: Server) {
    this.logger.log('Initialize Connectoin and Disconnection Gateway Done');
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.logger.log(`${client.id}로 부터 connection 요청`);
    let user: User;
    let room: Room;
    try {
      ({ user, room } = await this.getUserAndRoom(client.handshake));
      await this.setClientStatus(client, user, room);
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
    await this.joinClientInRoom(room, client);

    this.logger.log(`연결된 Client id: ${client.id} status: ${client.status}`);
  }

  async handleDisconnect(client: RoomSocket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    if (client.status == undefined || client.status == SocketStatus.REFLASING) {
      return;
    }
    this.logger.log(
      `${client.user.name}이 다음 상태에서 종료: ${client.status}`,
    );
    // TODO: type에 따라서 방의 상태도 바꾸기
    const room: Room = client.room;
    const user: User = client.user;
    if (client.status == SocketStatus.CREATOR) {
      room.creatorSocket = undefined;
      room.status = RoomStatus.CLOSING;
      room.finishedAt = new Date();

      room.watingSockets.forEach((socket) => {
        socket.emit('invite-rejected', {
          message: '초대 요청이 거절되었습니다',
        });
        socket.disconnect(true);
      });

      room.watingSockets = [];

      this.server.to(room.uuid).emit('uesr-disconnected', {
        message: '상대방이 나갔습니다',
        data: {
          name: user.name,
          email: user.email,
          peerId: client.peerId,
        },
      });
      this.server.to(room.uuid).disconnectSockets(true);
    } else if (client.status == SocketStatus.PARTICIPANT) {
      room.participantSocket = undefined;
      room.status = RoomStatus.CLOSING;

      this.server.to(room.uuid).emit('uesr-disconnected', {
        message: '상대방이 나갔습니다',
        data: {
          name: user.name,
          email: user.email,
          peerId: client.peerId,
        },
      });
      this.server.to(room.uuid).disconnectSockets(true);
    } else if (client.status == SocketStatus.WAITER) {
      if (room.watingSockets.length == 0) {
        return;
      }
      const indexToRemove = room.watingSockets.findIndex(
        (socket) => socket.user.pk == user.pk,
      );
      if (indexToRemove == -1) {
        this.logger.error(
          `WAITER가 disconnect되기 전에 목록에서 사라짐 ${user.name} in ${room.uuid}`,
        );
        return;
      }
      room.watingSockets.splice(indexToRemove);
    }
  }

  private async setClientStatus(client: RoomSocket, user: User, room: Room) {
    // 이전 연결을 유지한 채로 다시 참여하는 경우
    const beforeSocket = await this.roomsService.findRoomSocket(room, user);
    if (beforeSocket) {
      copyFromBeforeSocket(beforeSocket, client);
      disconnectBeforeSocket(beforeSocket);
      return;
    }
    switch (room.status) {
      // 방장이 입장하지 않은 방인 경우
      case RoomStatus.WATING:
        if (room.creatorPk != user.pk) {
          throw new Error('방장이 입장하지 않습니다.');
        }
        client.status = SocketStatus.CREATOR;
        break;
      // 방장이 초대 중인 경우
      case RoomStatus.INVITING:
        client.status = SocketStatus.WAITER;
        break;
      case RoomStatus.CREATOR_OUT:
      case RoomStatus.PARTICIPANT_OUT:
        const beforInformation = room.creatorInformation;
        if (beforInformation.userPk != user.pk) {
          throw new Error(
            `이미 개최중이거나 종료중인 방입니다: ${room.status}`,
          );
        }
        beforInformation.clearTimeout();
        beforInformation.setSocket(client);
        room.status = RoomStatus.RUNNING;
        break;
      default:
        throw new Error(`이미 개최중이거나 종료중인 방입니다: ${room.status}`);
    }
  }

  private async joinClientInRoom(room: Room, client: RoomSocket) {
    if (client.status == SocketStatus.CREATOR) {
      // 처음 방장이 입장한 경우
      if (room.status == RoomStatus.WATING) {
        room.status = RoomStatus.INVITING;
        this.logger.log(`${room.uuid}에서 초대를 시작합니다`);
      }
      room.creatorSocket = client;
      client.join(room.uuid);
      this.logger.log('방장이 되었습니다.');
    } else if (client.status == SocketStatus.PARTICIPANT) {
      room.participantSocket = client;
      this.logger.log(`참가자가 되었습니다.`);
    } else if (client.status == SocketStatus.WAITER) {
      room.watingSockets.push(client);
      this.server.to(room.uuid).emit('join-request-by', {
        message: '참가 요청이 왔습니다.',
        data: {
          participant: {
            name: client.user.name,
            email: client.user.email,
          },
        },
      });
      this.logger.log('대기자에 추가되었습니다.');
    } else {
      this.logger.error(`동일한 connect 요청 과정에서 예상하지 못 한 에러`);
      this.logger.error(`${client.status}`);
      throw new WsException(
        '동일한 connect 요청 과정에서 문제가 생겼습니다. 백앤드를 불러주세요.',
      );
    }
  }

  private async getUserAndRoom(handshake: Handshake) {
    const cookie = handshake.headers.cookie;
    if (cookie == undefined) {
      throw new Error('로그인 하지 않았습니다');
    }
    const cookieMap = new URLSearchParams(cookie.replace(/; /g, '&'));
    const token: string = cookieMap.get('token');
    const payload: JwtPayloadDto = await this.authService.getUser(token);
    const user = await this.usersService.findUserbyPayload(payload);

    let roomUuid = handshake.query.roomUuid;
    if (Array.isArray(roomUuid)) {
      roomUuid = roomUuid[0];
    }
    this.logger.log(`유저 정보 ${user.email} ${user.name}`);
    this.logger.log(`받은 room uuid ${roomUuid}`);
    const room = await this.roomsService.findRoombyUuid(roomUuid);
    if (!room) {
      throw new Error('방이 존재하지 않습니다.');
    }

    return { user, room };
  }
}
