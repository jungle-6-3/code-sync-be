import { Injectable, Logger } from '@nestjs/common';
import {
  copyFromBeforeSocket,
  disconnectBeforeSocket,
  RoomSocket,
  SocketStatus,
} from './interfaces/room-socket.interface';
import { User } from 'src/users/entities/user.entity';
import { Room, RoomStatus } from 'src/rooms/room';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { SocketInformation } from './interfaces/socket-information.interface';
import { Handshake } from 'socket.io/dist/socket-types';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
export class ConversationEventsService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private roomsService: RoomsService,
  ) {}
  logger: Logger = new Logger('ConnectionAndDisconnectionEventGateway');

  async setClientStatus(client: RoomSocket, user: User, room: Room) {
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
        let beforInformation: SocketInformation;
        if (room.status == RoomStatus.CREATOR_OUT) {
          beforInformation = room.creatorInformation;
        } else {
          beforInformation = room.participantInformation;
        }

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

  async joinClientInRoom(room: Room, server: Server, client: RoomSocket) {
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
    } else {
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
    const room = await this.roomsService.findRoombyUuid(roomUuid);
    if (!room) {
      throw new Error('방이 존재하지 않습니다.');
    }

    return { user, room };
  }
}
