import { Injectable, Logger } from '@nestjs/common';
import {
  copyFromBeforeSocket,
  disconenctRoomSocket,
  disconnectBeforeSocket,
  RoomSocket,
  SocketStatus,
} from './interfaces/room-socket.interface';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/item';
import { RoomStatus } from 'src/rooms/item/room-event';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { Handshake } from 'socket.io/dist/socket-types';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomEventService } from 'src/rooms/item/room-event/room-event.service';

@Injectable()
export class ConversationEventsService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private roomsService: RoomsService,
    private roomEventsService: RoomEventService,
  ) {}
  logger: Logger = new Logger('ConnectionAndDisconnectionEventGateway');

  async setClientStatus(client: RoomSocket, user: User, room: Room) {
    // 이전 연결을 유지한 채로 다시 참여하는 경우
    const beforeSocket = await this.roomEventsService.findRoomSocket(
      room,
      user,
    );
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
      // Running인 방에서 나간 사람이 돌아온 경우
      case RoomStatus.CREATOR_OUT:
      case RoomStatus.PARTICIPANT_OUT:
        if (room.outSocketInformation?.userPk != user.pk) {
          throw new Error(
            `이미 개최중이거나 종료중인 방입니다: ${room.status}`,
          );
        }
        room.outSocketInformation.clearTimeout();
        room.outSocketInformation.setSocket(client);
        room.outSocketInformation = undefined;
        room.status = RoomStatus.RUNNING;
        break;
      default:
        throw new Error(`이미 개최중이거나 종료중인 방입니다: ${room.status}`);
    }
  }

  async joinClientInRoom(room: Room, server: Server, client: RoomSocket) {
    switch (client.status) {
      case SocketStatus.CREATOR:
        // 처음 방장이 입장한 경우
        if (room.status == RoomStatus.WATING) {
          room.status = RoomStatus.INVITING;
          this.logger.log(`${room.uuid}에서 초대를 시작합니다`);
        }
        room.creatorSocket = client;
        client.join(room.uuid);
        setTimeout(() => {
          client.emit('invite-accepted', {
            message: '대화를 시작합니다.',
            prUrl: room.prUrl,
            role: 'creator',
          });
        }, 2000);
        this.logger.log('방장이 되었습니다.');
        break;
      case SocketStatus.PARTICIPANT:
        room.participantSocket = client;
        client.join(room.uuid);
        setTimeout(() => {
          client.emit('invite-accepted', {
            message: '대화를 시작합니다.',
            prUrl: room.prUrl,
            role: 'creator',
          });
        }, 2000);
        this.logger.log(`참가자가 되었습니다.`);
        break;
      case SocketStatus.WAITER:
        room.waitingSockets.push(client);
        server.to(room.uuid).emit('join-request-by', {
          message: '참가 요청이 왔습니다.',
          data: {
            participant: {
              name: client.user.name,
              email: client.user.email,
            },
          },
        });
        this.logger.log('대기자에 추가되었습니다.');
        break;
      default:
        this.logger.error(`동일한 connect 요청 과정에서 예상하지 못 한 에러`);
        this.logger.error(`${client.status}`);
        throw new WsException(
          '동일한 connect 요청 과정에서 문제가 생겼습니다. 백앤드를 불러주세요.',
        );
    }
  }

  async getUserAndRoom(handshake: Handshake) {
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
    const room = await this.roomsService.findRoomByUuid(roomUuid);
    if (!room) {
      throw new Error('방이 존재하지 않습니다.');
    }

    return { user, room };
  }

  async setClientDisconnect(server: Server, client: RoomSocket) {
    const room: Room = client.room;
    const user: User = client.user;
    switch (client.status) {
      case SocketStatus.REFLASING:
        break;
      case SocketStatus.WAITER:
        if (room.waitingSockets.length == 0) {
          break;
        }
        const indexToRemove = room.waitingSockets.findIndex(
          (socket) => socket.user.pk == user.pk,
        );
        if (indexToRemove == -1) {
          this.logger.error(
            `WAITER가 disconnect되기 전에 목록에서 사라짐 ${user.name} in ${room.uuid}`,
          );
          throw new WsException(
            '대기자를 disconenct 과정에서 먼가 문제가 생겼습니다.\
            백앤드를 불러주세요.',
          );
        }
        room.waitingSockets.splice(indexToRemove);
        break;
      case SocketStatus.CREATOR:
        room.creatorSocket = undefined;
        switch (room.status) {
          case RoomStatus.WATING:
          case RoomStatus.INVITING:
            this.roomEventsService.deleteRoom(room);
            break;
          case RoomStatus.PARTICIPANT_OUT:
            this.roomEventsService.closeRoom(room);
            break;
          case RoomStatus.RUNNING:
            room.status = RoomStatus.CREATOR_OUT;
            this.roomEventsService.closeRoomAfter(room, client, 5);
            server.to(room.uuid).emit('user-disconnected', {
              message: '상대방이 나갔습니다',
              data: {
                name: user.name,
                email: user.email,
                peerId: client.peerId,
              },
            });
            break;
          case RoomStatus.CLOSING:
            break;
          default:
            this.logger.error(
              `${client.user.name}이 creator로 나가는데 방의 status가 ${room.status}`,
            );
            break;
        }
        break;
      case SocketStatus.PARTICIPANT:
        room.participantSocket = undefined;
        switch (room.status) {
          case RoomStatus.CREATOR_OUT:
            this.roomEventsService.closeRoom(room);
            break;
          case RoomStatus.RUNNING:
            room.status = RoomStatus.PARTICIPANT_OUT;
            this.roomEventsService.closeRoomAfter(room, client, 5);
            server.to(room.uuid).emit('user-disconnected', {
              message: '상대방이 나갔습니다',
              data: {
                name: user.name,
                email: user.email,
                peerId: client.peerId,
              },
            });
            break;
          case RoomStatus.CLOSING:
            break;
          default:
            this.logger.error(
              `${client.user.name}이 participant 나가는데 방의 status가 ${room.status}`,
            );
            break;
        }
        break;
      default:
        throw new WsException(`disconnect 과정에서 예상 못 한 case\
          ${client.user.name}: ${client.status}, ${room.uuid}: ${room.status}`);
    }
  }
}
