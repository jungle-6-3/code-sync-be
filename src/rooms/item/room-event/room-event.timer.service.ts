import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { logger } from '.';
import { Room } from '..';
import { RoomSocket } from 'src/conversation-events/room-socket';
import { SocketInformation } from './socket-information';
import { RoomEventService } from './room-event.service';

@Injectable()
export class RoomEventTimerService {
  constructor(
    @Inject(forwardRef(() => RoomEventService))
    private roomEventService: RoomEventService,
  ) {}
  private logger = logger;

  deleteRoomAfter(room: Room, minute: number) {
    this.logger.log(`${room.uuid}가 ${minute} 후에 삭제`);
    if (room.globalTimeoutId) {
      this.logger.error(
        `deleteRoomAfter 하기 전에 timeoutId가 설정 됨: ${room.uuid}`,
      );
    }
    room.globalTimeoutId = setTimeout(
      () => this.roomEventService.deleteRoom(room),
      minute * 60 * 1000,
    );
  }

  closeRoomAfter(room: Room, client: RoomSocket, minute: number) {
    this.clearTimeout(room);

    this.logger.log(`${room.uuid}가 ${minute} 후에 닫힘`);
    room.outSocketInformation = new SocketInformation(client);

    room.outSocketInformation.timeoutId = setTimeout(
      () => this.roomEventService.closeRoom(room),
      minute * 60 * 1000,
    );
  }

  clearTimeout(room: Room) {
    logger.log(`${room.uuid}의 timeout이 제거되었습니다.`);
    clearTimeout(room.globalTimeoutId);
    room.globalTimeoutId = undefined;
    if (room.outSocketInformation) {
      room.outSocketInformation.clearTimeout();
      room.outSocketInformation = undefined;
    }
  }
}
