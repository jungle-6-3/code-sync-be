import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConversationEventsFilter } from '../conversation-events.filter';
import {
  forwardRef,
  Inject,
  Logger,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { ValidateUserIsJoiningPipe } from '../pipes/validate-user-is-joining.pipe';
import { RoomSocket } from '../interfaces/room-socket.interface';
import { PeerJsService } from './peer-js.service';

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class PeerJsGateway {
  constructor(
    @Inject(forwardRef(() => PeerJsService))
    private peerJsService: PeerJsService,
  ) {}
  @WebSocketServer() server: Server;
  logger: Logger = new Logger('RoomEventGateway');

  @UsePipes(ValidateUserIsJoiningPipe)
  @SubscribeMessage('share-peer-id')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { peerId }: { peerId: string },
  ) {
    this.peerJsService.sharePeerIdHandler(client, peerId);
    return {
      sucess: true,
      message: 'Peer Id를 등록했습니다.',
    };
  }
}
