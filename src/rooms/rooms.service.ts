import { ForbiddenException, Injectable } from '@nestjs/common';
import { Room } from './room';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;
  private roomsByPk: Map<number, Room>;

  constructor() {
    this.roomsById = new Map();
    this.roomsByPk = new Map();
  }

  async createRoom(creator: User, prUrl: string): Promise<string> {
    if (await this.findRoombyPk(creator.pk)) {
      throw new ForbiddenException(
        '이미 대화에 참여하고 있는 방이 존재합니다.',
      );
    }
    const uuid = _uuid();
    const newRoom = new Room(uuid, creator, prUrl);
    this.setRoom(uuid, newRoom);
    return uuid;
  }

  async saveRoom(creator: User, roomUuid: string): Promise<boolean> {
    return true;
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  async findRoombyPk(userPk: number): Promise<Room> {
    return this.roomsByPk.get(userPk);
  }

  async setRoom(uuid: string, room: Room) {
    this.roomsById.set(uuid, room);
  }

  async joinRoom(userPk: number, room: Room) {
    this.roomsByPk.set(userPk, room);
  }

  async leaveRoom(userPk: number) {
    if (userPk) this.roomsByPk.delete(userPk);
  }

  async deleteRoom(room: Room) {
    this.leaveRoom(room.creator.pk);
    this.leaveRoom(room.participant.pk);
    this.roomsById.delete(room.uuid);

    room = null;
  }
}
