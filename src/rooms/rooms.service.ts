import { ForbiddenException, Injectable } from '@nestjs/common';
import { Room } from './room';
import { v4 as _uuid } from 'uuid';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;
  private roomsByPk: Map<number, Room>;

  constructor() {
    this.roomsById = new Map();
    this.roomsByPk = new Map();
  }

  async createRoom(creatorPk: number, prUrl: string): Promise<string> {
    if (await this.findRoombyPk(creatorPk)) {
      throw new ForbiddenException(
        '이미 대화에 참여하고 있는 방이 존재합니다.',
      );
    }
    const uuid = _uuid();
    const newRoom = new Room(uuid, creatorPk, prUrl);
    this.setRoom(uuid, newRoom);
    return `https://code-sync.net/${uuid}`;
  }

  async saveRoom(creatorPk: number, roomUuid: string): Promise<boolean> {
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
    this.leaveRoom(room.creatorPk);
    this.leaveRoom(room.participantPk);
    this.roomsById.delete(room.uuid);

    room = null;
  }
}
