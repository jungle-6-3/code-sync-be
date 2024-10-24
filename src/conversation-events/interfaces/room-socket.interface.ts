import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

export interface RoomSocket extends Socket {
  user: User;
  roomUuid: string;
}

export function initRoomSocket(
  socket: RoomSocket,
  user: User,
  roomUuid: string,
) {
  socket.user = user;
  socket.roomUuid = roomUuid;
}
