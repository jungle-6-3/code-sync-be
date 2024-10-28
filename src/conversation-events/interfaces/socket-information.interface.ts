import { Room } from 'src/rooms/room';
import { RoomSocket, SocketStatus } from './room-socket.interface';
import { RoomsService } from 'src/rooms/rooms.service';

//TODO: 여기 다른 것 추가해야하는지 front에게 묻기
export class SocketInformation {
  userPk: number;
  roomUuid: string;
  status: SocketStatus;
  peerId: string;
  timeoutId: NodeJS.Timeout;

  constructor(
    private roomsService: RoomsService,
    socket: RoomSocket,
  ) {
    this.userPk = socket.user.pk;
    this.roomUuid = socket.room.uuid;
    this.status = socket.status;
    this.peerId = socket.peerId;
  }

  setDisconnected(room: Room) {
    this.timeoutId = setTimeout(() => this.roomsService.deleteRoom(room));
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
