import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';

@Injectable()
export class SaveVoiceService {
  async startSaveVoice(room: Room) {}

  async finishSaveVoice(room: Room) {}
}
