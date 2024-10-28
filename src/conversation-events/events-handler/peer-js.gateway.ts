import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
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

@UseFilters(ConversationEventsFilter)
@WebSocketGateway(3001, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTION', 'FETCH', 'Put', 'DELETE'],
    credentials: true,
    transports: ['polling', 'websocket'],
  },
})
export class PeerJsGateway implements OnGatewayInit {
  constructor() {}

  @WebSocketServer() server: Server;
  logger: Logger = new Logger('PeerJsEventGateway');

  afterInit(server: Server) {
    this.logger.log('Initialize PeerJs Gateway Done');
  }

  @UsePipes(ValidateUserIsJoiningPipe)
  @SubscribeMessage('share-peer-id')
  async handleSubscribeMessage(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() { peerId }: { peerId: string },
  ) {
    const room = client.room;
    client.peerId = peerId;
    this.logger.log(
      `${room.uuid}에 ${client.user.name}의 peer Id ${peerId}를 공유합니다.`,
    );
    this.server.to(room.uuid).emit('new-peer-id', {
      message: '화면 공유 요청이 왔습니다.',
      data: {
        email: client.user.email,
        peerId: peerId,
      },
    });

    return {
      sucess: true,
      message: 'Peer Id를 등록했습니다.',
    };
  }
}
