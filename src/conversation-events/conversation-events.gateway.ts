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
import { RoomSocket, SocketStatus } from './interfaces/room-socket.interface';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';
import { ConversationEventsLoggerService } from './services/conversation-events-logger.service';
import { RoomEventsHandlerService } from './services/room-events-handler.service';
import { PeerJsEventsHandlerService } from './services/peer-js-events-handler.service';

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
    private loggerService: ConversationEventsLoggerService,
    private peerJsEventsHandlerService: PeerJsEventsHandlerService,
    private roomEventsHandlerService: RoomEventsHandlerService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = this.loggerService.getLogger();

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
    this.logger.log(`다음 유저로부터 초대 요청 ${client.user.name}`);
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
