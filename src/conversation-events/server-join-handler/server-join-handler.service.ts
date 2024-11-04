import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';
import { SaveVoiceService } from './save-voice.service';
import { SaveYjsService } from './save-yjs.service';

@Injectable()
export class ServerJoinHandlerService {
  constructor(
    private saveVoiceService: SaveVoiceService,
    private saveYjsService: SaveYjsService,
  ) {}
  async startServerJoin(room: Room) {
    await this.saveVoiceService.startSaveVoice(room);
    await this.saveYjsService.startSaveYjs(room);
  }

  async finishServerJoin(room: Room) {
    await this.saveVoiceService.finishSaveVoice(room);
    await this.saveYjsService.finishSaveYjs(room);
  }
}
