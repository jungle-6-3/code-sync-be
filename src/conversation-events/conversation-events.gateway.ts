import { forwardRef, Inject, Logger, UseFilters } from '@nestjs/common';
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
import { RoomSocket, SocketStatus } from './interfaces/room-socket.interface';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';
import { PeerJsService } from './events-handler/peer-js.service';
import { RoomService } from './events-handler/room.service';

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
    @Inject(forwardRef(() => PeerJsService))
    private peerJsEventsHandlerService: PeerJsService,
    @Inject(forwardRef(() => RoomService))
    private roomEventsHandlerService: RoomService,
  ) {}

  @WebSocketServer() server: Server;
  logger: Logger = new Logger('RoomEventGateway');

  // TODO: pipe로 creator나 participant인지 체크하도록 수정 필요.
  // TODO: 참여하고 있는 room이 running인지 확인하도록 수정 필요.
  @SubscribeMessage('share-peer-id')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { peerId }: { peerId: string },
  ) {
    this.peerJsEventsHandlerService.sharePeerIdHandler(
      this.server,
      client,
      peerId,
    );
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
    // 아래 글은 pipe로 대체되어야 함
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
    this.logger.log(
      `다음 유저로부터 초대 요청 ${client.user.name}, email: ${email}`,
    );
    if (client.status != SocketStatus.CREATOR) {
      throw new WsException('방장이 아니에요');
    }

    await this.roomEventsHandlerService.inviteUserHandler(
      this.server,
      client,
      email,
    );

    return {
      sucess: true,
      message: '대화를 시작합니다.',
    };
  }

  // TODO: pipe로 방장인지 체크하도록 수정 필요.
  @SubscribeMessage('reject-user')
  async handleRejectUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    this.logger.log(
      `다음 유저로부터 거절 요청 ${client.user.name}, email: ${email}`,
    );
    if (client.status != SocketStatus.CREATOR) {
      throw new WsException('방장이 아니에요');
    }

    await this.roomEventsHandlerService.rejectUserHandler(
      this.server,
      client,
      email,
    );

    return {
      sucess: true,
      message: '참가 요청을 거절했습니다.',
    };
  }

  afterInit(server: Server) {
    this.logger.log('Initialize WebSocket Server Done');
  }

  async handleDisconnect(client: RoomSocket) {
    this.roomEventsHandlerService.socketDisconnectHandler(this.server, client);
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.roomEventsHandlerService.socketConnectionHanlder(this.server, client);
  }
}
