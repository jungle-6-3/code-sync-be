import { SocketStatus } from './room-socket.interface';

//TODO: 여기 다른 것 추가해야하는지 front에게 묻기
export interface DisconnectedSocket {
  status: SocketStatus;
  peerId: string;
}
