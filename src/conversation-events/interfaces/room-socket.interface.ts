import { Socket } from 'socket.io';
import { Room } from 'src/rooms/room';
import { User } from 'src/users/entities/user.entity';

export enum SocketStatus {
  CREATOR = 'Creator',
  WAITER = 'Waiter',
  PARTICIPANT = 'Participant',
}

export interface RoomSocket extends Socket {
  user: User;
  room: Room;
  status: SocketStatus;
  peerId: string;
}

export function initRoomSocket(socket: RoomSocket, user: User, room: Room) {
  socket.user = user;
  socket.room = room;
}

export function setToCreator(socket: RoomSocket) {
  socket.status = SocketStatus.CREATOR;
}

export function setToWaiter(socket: RoomSocket) {
  socket.status = SocketStatus.WAITER;
}

export function setToParticipant(socket: RoomSocket) {
  socket.status = SocketStatus.PARTICIPANT;
}
