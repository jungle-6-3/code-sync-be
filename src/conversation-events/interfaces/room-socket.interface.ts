import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

export interface RoomSocket extends Socket {
  roomUuid: string;
  user: User;
}

export function initRoomSocket(socket: RoomSocket, user: User) {
  socket.user = user;
}
