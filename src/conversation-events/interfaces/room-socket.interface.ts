import { Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';

export interface RoomSocket extends Socket {
  roomUuid: string;
  userPk: number;
  email: string;
  name: string;
}

export function initRoomSocket(socket: RoomSocket, user: User) {
  if (user != undefined) {
    socket.userPk = user.pk;
    socket.email = user.email;
    socket.name = user.name;
  }
}
