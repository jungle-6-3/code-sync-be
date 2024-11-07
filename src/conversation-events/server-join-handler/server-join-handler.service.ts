import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';
import { SaveYjsService } from './save-yjs.service';

@Injectable()
export class ServerJoinHandlerService {
  constructor(private saveYjsService: SaveYjsService) {}
  async startServerJoin(room: Room) {
    await this.saveYjsService.startSaveYjs(room);
  }

  async finishServerJoin(room: Room) {
    await this.saveYjsService.finishSaveYjs(room);
  }
}
