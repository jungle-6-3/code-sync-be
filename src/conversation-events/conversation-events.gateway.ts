import { Logger } from '@nestjs/common';
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

@WebSocketGateway()
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

  @SubscribeMessage('join-request')
  async handleJoinRequest(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { uuid: roomUuid }: { uuid: string },
  ) {
    this.logger.log(`join-request from ${client.user}`);
    const room: Room = await this.roomsService.findRoombyUuid(roomUuid);
    if (!client.user) {
      throw new WsException('로그인 해주세요');
    }
    if (!room) {
      throw new WsException('방이 없어요');
    }

    if (room.status == RoomStatus.WATING && room.creator.pk == client.user.pk) {
      room.status = RoomStatus.INVITING;
      client.roomUuid = room.uuid;
      room.creator.socketId = client.id;
      client.join(roomUuid);
      this.logger.log(`Now ${room.uuid} room is Inviting`);
      return {
        success: true,
        message: '당신이 개최자입니다.',
      };
    }
    if (room.status == RoomStatus.INVITING) {
      const waitingUser = new RoomUser(client.user);
      waitingUser.socketId = client.id;
      // TODO watingUsers 리스트를 확인하고 push 그만하는 동작
      room.watingUsers.push(waitingUser);
      this.server.to(room.uuid).emit('join-request-by', {
        message: '초대 요청이 왔습니다.',
        data: {
          participant: {
            user: client.user.name,
            email: client.user.email,
          },
        },
      });
      this.logger.log(`To ${room.uuid} room, send join request`);
      return {
        success: true,
        message: '방이 존재합니다.',
      };
    }

    throw new WsException('백앤드를 부르면 어떤 에러인지 나와요');
  }

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
    const cookie = client.handshake.headers.cookie;
    const params = new URLSearchParams(cookie.replace(/; /g, '&'));
    const token: string = params.get('token');
    let user: User = undefined;
    try {
      const payload: JwtPayloadDto = await this.authService.getUser(token);
      user = await this.usersService.findUserbyPayload(payload);
    } finally {
      initRoomSocket(client, user);
    }

    this.logger.log(`Client Connected : ${client.id}`);
  }
}
