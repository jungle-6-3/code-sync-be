import { Socket } from 'socket.io';
import { Room } from 'src/rooms/item';
import { User } from 'src/users/entities/user.entity';

export enum SocketStatus {
  CREATOR = 'Creator',
  WAITER = 'Waiter',
  PARTICIPANT = 'Participant',
  // 이 상태라면 새로고침이기 때문에, rooms에 userPk가 사라지지 않음
  REFLASING = 'Reflashing',
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

/**
 * beforeSocket이 Waiter라면 watingSockets에서 없애야 하기에 WAITER로 설정.
 * 아니라면 room에 변화를 주면 안 되기 때문에, Reflasing으로 변경
 */
export function copyFromBeforeSocket(
  beforeSocket: RoomSocket,
  afterSocket: RoomSocket,
) {
  const { status, peerId } = beforeSocket;
  afterSocket.status = status;
  afterSocket.peerId = peerId;
}

export function disconnectBeforeSocket(beforeSocket: RoomSocket) {
  if (beforeSocket.status != SocketStatus.WAITER) {
    beforeSocket.status = SocketStatus.REFLASING;
  }
  beforeSocket.disconnect(true);
}

// server가 일방적으로 connection을 종료하는 경우
export function disconenctRoomSocket(socket: RoomSocket) {
  if (!socket) {
    return;
  }
  switch (socket.status) {
    case SocketStatus.WAITER:
      socket.emit('invite-rejected', {
        message: '초대 요청이 거절되었습니다.',
      });
      break;
    case SocketStatus.PARTICIPANT:
    case SocketStatus.CREATOR:
      socket.emit('room-closed', {
        message: '대화가 종료됩니다.',
      });
      break;
    default:
      break;
  }
  socket.disconnect(true);
}
