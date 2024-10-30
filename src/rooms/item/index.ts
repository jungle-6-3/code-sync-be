import { ChatData } from 'src/conversation-datas/data/chatting';
import { User } from 'src/users/entities/user.entity';
import { initRoomEvent, RoomEvent, RoomStatus } from './room-event';
import { RoomSocket } from 'src/conversation-events/room-socket';
import { SocketInformation } from 'src/rooms/item/room-event/socket-information';

export class Room implements RoomEvent {
  creatorPk: number;
  participantPk: number;
  startedAt: Date;
  finishedAt: Date;
  prUrl: string;

  // About RoomEvent
  uuid: string;
  status: RoomStatus;
  creatorSocket: RoomSocket;
  participantSocket: RoomSocket;
  watingSockets: RoomSocket[];
  globalTimeoutId: NodeJS.Timeout;
  outSocketInformation: SocketInformation;

  // About RoomData
  data: RoomData;

  constructor(uuid: string, creator: User, prUrl: string) {
    initRoomEvent(this, uuid);
    this.creatorPk = creator.pk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
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
