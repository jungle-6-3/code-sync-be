import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';

@Injectable()
export class SaveVoiceService {
  startSaveVoice(room: Room) {}

  finishSaveVoice(room: Room) {}
}
