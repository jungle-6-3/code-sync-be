import { Injectable } from '@nestjs/common';
import { CodeEditor } from 'src/conversation-datas/data/codeEditor';
import { DrawBoard } from 'src/conversation-datas/data/drawBoard';
import { Note } from 'src/conversation-datas/data/note';
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
    roomData.drawBoard = new DrawBoard(this.yjsService, yjsDocProvider);
    roomData.note = new Note(this.yjsService, yjsDocProvider);
    roomData.codeEditor = new CodeEditor(this.yjsService, yjsDocProvider);
  }
}
