import { ForbiddenException, Injectable } from '@nestjs/common';
import { Room, RoomStatus } from './room';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;

  constructor() {
    this.roomsById = new Map();
  }

  async createRoom(creator: User, prUrl: string): Promise<string> {
    const roomUuid = _uuid();
    const newRoom = new Room(roomUuid, creator, prUrl);
    this.setRoom(newRoom, roomUuid);
    return roomUuid;
  }

  // TODO: room 내용을 저장하는 행위를 해야함.
  async saveRoom(room: Room, creator: User): Promise<boolean> {
    // 저장하는 행위....
    this.deleteRoom(room);
    return true;
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  async setRoom(room: Room, uuid: string) {
    this.roomsById.set(uuid, room);
  }

  // TODO: 이거 나중에 수정해야 함
  async deleteRoom(room: Room) {
    const { creatorSocket, participantSocket } = room;
    room.status = RoomStatus.DELETED;
    if (creatorSocket) {
      creatorSocket.disconnect();
    }
    if (participantSocket) {
      participantSocket.disconnect();
    }
    // 경우에 따라서 waiter 처리도 해야함
    this.roomsById.delete(room.uuid);

    room = null;
  }
}
