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
  startServerJoin(room: Room) {
    this.saveVoiceService.startSaveVoice(room);
    this.saveYjsService.startSaveYjs(room);
  }

  //TODO: 방이 closing이 되면 연결을 끊는 logic을 해야 함
  finishServerJoin(room: Room) {
    this.saveVoiceService.finishSaveVoice(room);
    this.saveYjsService.finishSaveYjs(room);
  }
}
