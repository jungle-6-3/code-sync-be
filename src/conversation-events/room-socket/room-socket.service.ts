import { Injectable } from '@nestjs/common';
import { RoomSocket, SocketStatus } from '.';

@Injectable()
export class RoomSocketService {
  /**
   * beforeSocket이 Waiter라면 watingSockets에서 없애야 하기에 WAITER로 설정.
   * 아니라면 room에 변화를 주면 안 되기 때문에, Reflasing으로 변경
   */
  copyAndHandleBeforeSocket(beforeSocket: RoomSocket, afterSocket: RoomSocket) {
    const { status, peerId } = beforeSocket;
    afterSocket.status = status;
    afterSocket.peerId = peerId;

    if (beforeSocket.status != SocketStatus.WAITER) {
      beforeSocket.status = SocketStatus.REFLASING;
    }
    beforeSocket.disconnect(true);
  }

  disconenctRoomSocket(socket: RoomSocket) {
    if (!socket) {
      return;
    }
    if (!socket.status) {
      socket.disconnect(true);
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
}
