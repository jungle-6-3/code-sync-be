import { Injectable, Logger } from '@nestjs/common';
import { Room } from './item';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { RoomEventService } from './item/room-event/room-event.service';
import { RoomEventTimerService } from './item/room-event/room-event.timer.service';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;
  logger: Logger = new Logger('RoomsService');

  constructor(
    private roomEventsService: RoomEventService,
    private roomEventTimerService: RoomEventTimerService,
  ) {
    this.roomsById = new Map();
  }

  async createRoom(creator: User, prUrl: string) {
    const roomUuid = _uuid();
    const newRoom = new Room(roomUuid, creator, prUrl);
    this.roomsById.set(roomUuid, newRoom);
    this.roomEventTimerService.deleteRoomAfter(newRoom, 30);
    this.logger.log(`${creator.name}가 ${roomUuid}를 생성`);
    return roomUuid;
  }

  // TODO: room 내용을 저장하는 행위를 해야함.
  async saveRoom(room: Room, creator: User) {
    this.logger.log(`${creator.name}가 ${room.uuid}를 저장`);
    // 저장하는 행위....
    this.roomEventsService.deleteRoom(room);
    return true;
  }

  async findRoomByUuid(uuid: string) {
    return this.roomsById.get(uuid);
  }

  async deleteRoombyUuid(uuid: string) {
    this.logger.log(`${uuid}을 map에서 제거`);
    this.roomsById.delete(uuid);
  }
}
