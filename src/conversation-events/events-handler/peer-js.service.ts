import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { RoomSocket } from '../interfaces/room-socket.interface';
import { Server } from 'socket.io';
import { ConversationEventsGateway } from '../conversation-events.gateway';
import { OnServerInit } from '../interfaces/on-server-init.interface';

@Injectable()
export class PeerJsService implements OnServerInit {
  constructor(
    @Inject(forwardRef(() => ConversationEventsGateway))
    private conversationEventsGateway: ConversationEventsGateway,
  ) {}
  private server: Server;
  private logger: Logger;

  async sharePeerIdHandler(client: RoomSocket, peerId: string) {
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
  }

  afterServerInit(server: Server): void {
    this.server = server;
    this.logger = this.conversationEventsGateway.logger;
  }
}
