import { RoomSocket, SocketStatus } from './room-socket.interface';

//TODO: 여기 다른 것 추가해야하는지 front에게 묻기
export class SocketInformation {
  userPk: number;
  roomUuid: string;
  status: SocketStatus;
  peerId: string;
  timeoutId: NodeJS.Timeout;

  constructor(socket: RoomSocket) {
    this.userPk = socket.user.pk;
    this.roomUuid = socket.room.uuid;
    this.status = socket.status;
    this.peerId = socket.peerId;
  }
}
