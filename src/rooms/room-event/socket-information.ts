import { logger } from 'src/rooms/room-event';
import {
  RoomSocket,
  SocketStatus,
} from '../../conversation-events/room-socket';

//TODO: 여기 다른 것 추가해야하는지 front에게 묻기
export class SocketInformation {
  userPk: number;
  status: SocketStatus;
  peerId: string;
  timeoutId: NodeJS.Timeout;

  constructor(socket: RoomSocket) {
    this.userPk = socket.user.pk;
    this.status = socket.status;
    this.peerId = socket.peerId;
  }

  clearTimeout() {
    logger.log(`재진입으로 인한 timeout 제거`);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  setSocket(socket: RoomSocket) {
    socket.status = this.status;
    socket.peerId = this.peerId;
  }
}
