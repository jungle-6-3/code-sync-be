import { Injectable } from '@nestjs/common';
import { Room } from './room';

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  async createRoom(creatorPk: number, prUrl: string): Promise<string> {
    return 'This action adds a new room';
  }

  async saveRoom(creatorPk: number, roomUuid: string): Promise<boolean> {
    return true;
  }
}
