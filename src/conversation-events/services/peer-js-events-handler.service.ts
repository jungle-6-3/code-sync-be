import { Injectable } from '@nestjs/common';
import { RoomSocket } from '../interfaces/room-socket.interface';
import { Server } from 'socket.io';

@Injectable()
export class PeerJsEventsHandlerService {
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
