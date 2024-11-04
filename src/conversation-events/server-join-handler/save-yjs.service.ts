import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';
import { YjsService } from 'src/yjs/yjs.service';

@Injectable()
export class SaveYjsService {
  constructor(private yjsService: YjsService) {}

  startSaveYjs(room: Room) {
    const { yjsDocProvider, uuid } = room;
    this.yjsService.initYjsDocProvider(yjsDocProvider, uuid);
  }

  finishSaveYjs(room: Room) {
    const { yjsDocProvider } = room;
    this.yjsService.closeYjsDocProvider(yjsDocProvider);
  }
}
