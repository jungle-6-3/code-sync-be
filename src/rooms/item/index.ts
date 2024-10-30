import { ChatData } from 'src/conversation-datas/data/chatting';
import { User } from 'src/users/entities/user.entity';
import { RoomEvent } from './room-event';

export class Room {
  creatorPk: number;
  participantPk: number;
  startedAt: Date;
  finishedAt: Date;
  prUrl: string;

  roomEvent: RoomEvent;
  data: RoomData;

  constructor(uuid: string, creator: User, prUrl: string) {
    this.creatorPk = creator.pk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
    this.roomEvent = new RoomEvent(uuid);
    this.data = {
      chat: new ChatData(),
    };
  }
}

interface RoomData {
  chat: ChatData;
  // note?: NoteData;
  // draw?: DrawData;
}
