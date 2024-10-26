import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  initRoomSocket,
  reflashRoomSocket,
  RoomSocket,
  setToCreator,
  setToParticipant,
  setToWaiter,
  SocketStatus,
} from '../interfaces/room-socket.interface';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { User } from 'src/users/entities/user.entity';
import { Room, RoomStatus } from 'src/rooms/room';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { ConversationException } from '../conversation-events.filter';
import { WsException } from '@nestjs/websockets';
import { ConversationEventsGateway } from '../conversation-events.gateway';

@Injectable()
export class RoomService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private roomsService: RoomsService,
    @Inject(forwardRef(() => ConversationEventsGateway))
    private conversationEventsGateway: ConversationEventsGateway,
  ) {}
  private server: Server = this.conversationEventsGateway.server;
  private logger: Logger = this.conversationEventsGateway.logger;

  async socketConnectionHanlder(server: Server, client: RoomSocket) {
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
      user = await this.usersService.findUserbyPayload(payload);
      this.logger.log(`유저 정보 ${user.email} ${user.name}`);

      let roomUuid = client.handshake.query.roomUuid;
      if (Array.isArray(roomUuid)) {
        roomUuid = roomUuid[0];
      }
      this.logger.log(`받은 room uuid ${roomUuid}`);
      room = await this.roomsService.findRoombyUuid(roomUuid);
      if (!room) {
        throw new Error('방이 존재하지 않습니다.');
      }
      const beforeSocket = await this.roomsService.findRoomSocket(room, user);
      console.log(beforeSocket);
      // 다시 참여하는 경우
      if (beforeSocket) {
        reflashRoomSocket(beforeSocket, client);

        afterInitSocketFuncion = () => {};
      }
      // 방장이 입장하지 않은 방인 경우
      else if (room.status == RoomStatus.WATING) {
        if (room.creatorPk != user.pk) {
          throw new Error('방장이 입장하지 않습니다.');
        }

        setToCreator(client);
        afterInitSocketFuncion = () => {
          room.status = RoomStatus.INVITING;
          room.creatorSocket = client;
          client.join(roomUuid);
          this.logger.log('방장이 되었습니다.');
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

        setToWaiter(client);
        afterInitSocketFuncion = () => {
          room.watingSockets.push(client);
          this.logger.log('대기자에 추가되었습니다.');

          server.to(room.uuid).emit('join-request-by', {
            message: '참가 요청이 왔습니다.',
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
      this.logger.log((error as Error).stack);
      client.emit('exception', error.message);
      client.disconnect(true);
      return;
    }
    initRoomSocket(client, user, room);
    afterInitSocketFuncion();

    this.logger.log(`연결된 Client id: ${client.id} status: ${client.status}`);
  }

  async socketDisconnectHandler(server: Server, client: RoomSocket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
    if (client.status == undefined || client.status == SocketStatus.REFLASING) {
      return;
    }
    // TODO: type에 따라서 방의 상태도 바꾸기
    const room: Room = client.room;
    const user: User = client.user;
    if (client.status == SocketStatus.CREATOR) {
      room.creatorSocket = undefined;
      room.status = RoomStatus.CLOSING2;
      room.finishedAt = new Date();

      room.watingSockets.forEach((socket) => {
        socket.emit('invite-rejected', {
          message: '초대 요청이 거절되었습니다',
        });
        socket.disconnect(true);
      });

      room.watingSockets = [];

      server.to(room.uuid).emit('uesr-disconnected', {
        message: '상대방이 나갔습니다',
        data: {
          name: user.name,
          email: user.email,
          peerId: client.peerId,
        },
      });
      server.to(room.uuid).disconnectSockets(true);
    } else if (client.status == SocketStatus.PARTICIPANT) {
      room.participantSocket = undefined;
      room.status = RoomStatus.CLOSING2;

      server.to(room.uuid).emit('uesr-disconnected', {
        message: '상대방이 나갔습니다',
        data: {
          name: user.name,
          email: user.email,
          peerId: client.peerId,
        },
      });
      server.to(room.uuid).disconnectSockets(true);
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

  async inviteUserHandler(server: Server, client: RoomSocket, email: string) {
    const room = client.room;

    const participantSocket: RoomSocket = room.watingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!participantSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    room.watingSockets.forEach((socket) => {
      if (socket != participantSocket) {
        socket.emit('invite-rejected', {
          message: '초대 요청이 거절되었습니다',
        });
        socket.disconnect(true);
      }
    });
    room.watingSockets = [];

    setToParticipant(participantSocket);
    participantSocket.join(room.uuid);
    room.participantSocket = participantSocket;
    participantSocket.emit('invite-accepted', {
      message: '대화를 시작합니다.',
    });

    this.logger.log(`Now ${room.uuid} room is Running`);
    room.status = RoomStatus.RUNNING;
  }

  async rejectUserHandler(server: Server, client: RoomSocket, email: string) {
    const room = client.room;
    const rejectedSocket: RoomSocket = room.watingSockets.find(
      (socket) => socket.user.email == email,
    );
    if (!rejectedSocket) {
      throw new WsException('email에 해당되는 participant를 못 찾겠어요');
    }
    rejectedSocket.emit('invite-rejected', {
      message: '초대 요청이 거절되었습니다.',
    });
    rejectedSocket.disconnect(true);
  }
}
