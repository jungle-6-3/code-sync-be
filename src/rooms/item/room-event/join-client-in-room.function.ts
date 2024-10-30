import { RoomSocket, SocketStatus } from 'src/conversation-events/room-socket';
import { Room } from '..';
import { RoomStatus } from '.';
import { Logger } from '@nestjs/common';
export const joinClientInRoom = {
  [SocketStatus.CREATOR]: joinAsCreator,
  [SocketStatus.PARTICIPANT]: joinAsParticipant,
  [SocketStatus.WAITER]: joinAsWaiter,
} as const;

function joinAsCreator(room: Room, client: RoomSocket, logger: Logger) {
  if (room.status == RoomStatus.WATING) {
    room.status = RoomStatus.INVITING;
    logger.log(`${room.uuid}에서 초대를 시작합니다`);
  }
  room.creatorSocket = client;
  client.join(room.uuid);
  setTimeout(() => {
    client.emit('invite-accepted', {
      message: '대화를 시작합니다.',
      prUrl: room.prUrl,
      role: 'creator',
    });
  }, 2000);
  logger.log('방장이 되었습니다.');
}

function joinAsParticipant(room: Room, client: RoomSocket, logger: Logger) {
  room.participantSocket = client;
  client.join(room.uuid);
  setTimeout(() => {
    client.emit('invite-accepted', {
      message: '대화를 시작합니다.',
      prUrl: room.prUrl,
      role: 'creator',
    });
  }, 2000);
  logger.log(`참가자가 되었습니다.`);
}

function joinAsWaiter(room: Room, client: RoomSocket, logger: Logger) {
  room.watingSockets.push(client);
  client.to(room.uuid).emit('join-request-by', {
    message: '참가 요청이 왔습니다.',
    data: {
      participant: {
        name: client.user.name,
        email: client.user.email,
      },
    },
  });
  logger.log('대기자에 추가되었습니다.');
}
