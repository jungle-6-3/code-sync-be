import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { initRoomSocket, RoomSocket } from './interfaces/room-socket.interface';

@WebSocketGateway()
export class ConversationEventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RoomEventGateway');

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
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
