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
