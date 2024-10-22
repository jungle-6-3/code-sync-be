import { ForbiddenException, Injectable } from '@nestjs/common';
import { Room } from './room';
import { v4 as _uuid } from 'uuid';
import { Rooms } from './rooms';

@Injectable()
export class RoomsService {
  private rooms: Rooms;

  constructor() {
    this.rooms = new Rooms();
  }

  async createRoom(creatorPk: number, prUrl: string): Promise<string> {
    if (await this.rooms.findRoombyPk(creatorPk)) {
      throw new ForbiddenException(
        '이미 대화에 참여하고 있는 방이 존재합니다.',
      );
    }
    const uuid = _uuid();
    const newRoom = new Room(uuid, creatorPk, prUrl);
    this.rooms.setRoom(uuid, newRoom);
    return `https://code-sync.net/${uuid}`;
  }

  async saveRoom(creatorPk: number, roomUuid: string): Promise<boolean> {
    return true;
  }
}
