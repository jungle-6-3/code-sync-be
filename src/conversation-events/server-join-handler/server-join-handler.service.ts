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
  //TODO: 방이 running이 되면 방에 참여하는 logic을 해야 함
  async startServerJoin(room: Room) {
    await this.saveVoiceService.startSaveVoice(room);
    await this.saveYjsService.startSaveYjs(room);
  }

  //TODO: 방이 closing이 되면 연결을 끊는 logic을 해야 함
  async finishServerJoin(room: Room) {
    await this.saveVoiceService.finishSaveVoice(room);
    await this.saveYjsService.finishSaveYjs(room);
  }
}
