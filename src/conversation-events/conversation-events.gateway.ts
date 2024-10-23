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
    const room: Room = await this.roomsService.findRoombyUuid(roomUuid);
    if (!client.user) {
      throw new WsException('로그인 좀 하세요');
    }
    if (!room) {
      throw new WsException('방이 없어요');
    }

    if (room.status == RoomStatus.WATING && room.creator.pk == client.user.pk) {
      room.status = RoomStatus.INVITING;
      client.roomUuid = room.uuid;
      return {
        success: true,
        message: '당신이 개최자입니다.',
      };
    }
    if (room.status == RoomStatus.INVITING) {
      const waitingUser = new RoomUser(client.user);
      // TODO watingUsers 리스트를 확인하고 push 그만하는 동작
      room.watingUsers.push(waitingUser);
      return {
        success: true,
        message: '방이 존재합니다.',
      };
    }

    throw new WsException('백앤드를 부르면 어떤 에러인지 나와요');
  }

  @SubscribeMessage('invite-user')
  handleInviteUser(client: any, payload: any): string {
    return 'Hello world!';
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
