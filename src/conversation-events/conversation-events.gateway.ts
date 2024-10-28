import {
  forwardRef,
  Inject,
  Logger,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomSocket } from './interfaces/room-socket.interface';
import {
  ConversationEventsFilter,
  ConversationException,
} from './conversation-events.filter';
import { PeerJsService } from './events-handler/peer-js.service';
import { RoomService } from './events-handler/room.service';
import { ValidateUserIsJoiningPipe } from './pipes/validate-user-is-joining.pipe';
import { ValidateUserIsCreatorPipe } from './pipes/validate-user-is-creator.pipe';

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
    private peerJsService: PeerJsService,
    @Inject(forwardRef(() => RoomService))
    private roomService: RoomService,
  ) {}

  @WebSocketServer() server: Server;
  logger: Logger = new Logger('RoomEventGateway');

  // @UsePipes(ValidateUserIsJoiningPipe)
  // @SubscribeMessage('share-peer-id')
  // async handleSubscribeMessage(
  //   @ConnectedSocket() client: RoomSocket,
  //   @MessageBody() { peerId }: { peerId: string },
  // ) {
  //   this.peerJsService.sharePeerIdHandler(client, peerId);
  //   return {
  //     sucess: true,
  //     message: 'Peer Id를 등록했습니다.',
  //   };
  // }

  @UsePipes(ValidateUserIsCreatorPipe)
  @SubscribeMessage('invite-user')
  async handleInviteUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    await this.roomService.inviteUserHandler(client, email);

    return {
      sucess: true,
      message: '대화를 시작합니다.',
    };
  }

  @UsePipes(ValidateUserIsCreatorPipe)
  @SubscribeMessage('reject-user')
  async handleRejectUser(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { email }: { email: string },
  ) {
    await this.roomService.rejectUserHandler(client, email);

    return {
      sucess: true,
      message: '참가 요청을 거절했습니다.',
    };
  }

  afterInit(server: Server) {
    this.logger.log('Initialize WebSocket Server Done');
    this.peerJsService.afterServerInit(server);
    this.roomService.afterServerInit(server);
  }

  async handleDisconnect(client: RoomSocket) {
    this.roomService.socketDisconnectHandler(client);
  }

  async handleConnection(client: RoomSocket, ...args: any[]) {
    this.roomService.socketConnectionHanlder(client);
  }
}
