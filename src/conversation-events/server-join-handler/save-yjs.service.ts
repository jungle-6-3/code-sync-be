import { Injectable } from '@nestjs/common';
import { drawBoard } from 'src/conversation-datas/data/drawBoard';
import { Room } from 'src/rooms/item';
import { YjsService } from 'src/yjs/yjs.service';

@Injectable()
export class SaveYjsService {
  constructor(private yjsService: YjsService) {}

  async startSaveYjs(room: Room) {
    await this.yjsService.initYjsDocProvider(room);
  }

  async finishSaveYjs(room: Room) {
    const { yjsDocProvider } = room;
    await this.yjsService.closeYjsDocProvider(yjsDocProvider);
    const roomData = room.data;
    roomData.drawBoard = new drawBoard(this.yjsService, yjsDocProvider);
  }
}
