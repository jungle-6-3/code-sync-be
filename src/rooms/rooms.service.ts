import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomsService {
  async createRoom(creatorPk: number, prUrl: string): Promise<string> {
    return 'This action adds a new room';
  }

  async saveRoom(creatorPk: number, roomUuid: string): Promise<boolean> {
    return true;
  }
}
