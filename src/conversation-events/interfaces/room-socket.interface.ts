import { Socket } from 'socket.io';

export interface RoomSocket extends Socket {
  roomUuid: string;
  userPk: number;
  peerId: string;
}
