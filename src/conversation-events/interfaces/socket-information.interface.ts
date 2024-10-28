import { Room } from 'src/rooms/room';
import { RoomSocket, SocketStatus } from './room-socket.interface';
import { RoomsService } from 'src/rooms/rooms.service';

//TODO: 여기 다른 것 추가해야하는지 front에게 묻기
export class SocketInformation {
  userPk: number;
  room: Room;
  status: SocketStatus;
  peerId: string;
  timeoutId: NodeJS.Timeout;

  constructor(socket: RoomSocket) {
    this.userPk = socket.user.pk;
    this.room = socket.room;
    this.status = socket.status;
    this.peerId = socket.peerId;
  }

  clearTimeout() {
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
