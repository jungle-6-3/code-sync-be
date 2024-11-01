import { Injectable } from '@nestjs/common';
import { Room } from 'src/rooms/item';

@Injectable()
export class SaveYjsService {
  startSaveYjs(room: Room) {}
  finishSaveYjs(room: Room) {}
}
