import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RoomSocket } from '../interfaces/room-socket.interface';
import { Server } from 'socket.io';
import { ConversationEventsGateway } from '../conversation-events.gateway';

@Injectable()
export class PeerJsService {
  constructor(
    @Inject(forwardRef(() => ConversationEventsGateway))
    private conversationEventsGateway: ConversationEventsGateway,
  ) {}
  private server: Server = this.conversationEventsGateway.server;
  private logger: Logger = this.conversationEventsGateway.logger;

  async sharePeerIdHandler(server: Server, client: RoomSocket, peerId: string) {
    const room = client.room;
    server.to(room.uuid).emit('new-peer-id', {
      message: '화면 공유 요청이 왔습니다.',
      data: {
        email: client.user.email,
        peerId: peerId,
      },
    });
  }
}
