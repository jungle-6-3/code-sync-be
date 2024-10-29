import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';
import { ChatData } from 'src/conversation-datas/data/chatting';
import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { User } from 'src/users/entities/user.entity';

export enum RoomStatus {
  WATING = 'Wating',
  INVITING = 'Inviting',
  RUNNING = 'Running',
  CREATOR_OUT = 'CreatorOut',
  PARTICIPANT_OUT = 'ParticipantOut',
  CLOSING = 'Closing',
}

export class Room {
  uuid: string;

  status: RoomStatus;

  creatorPk: number;

  creatorSocket: RoomSocket;

  participantSocket: RoomSocket;

  watingSockets: RoomSocket[];

  startedAt: Date;

  finishedAt: Date;

  prUrl: string;

  globalTimeoutId: NodeJS.Timeout;

  outSocketInformation: SocketInformation;

  // TODO: data의 타입이 정해지면 수정 해야함
  data: RoomData;

  constructor(uuid: string, creator: User, prUrl: string) {
    this.uuid = uuid;
    this.status = RoomStatus.WATING;
    this.creatorPk = creator.pk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
    this.watingSockets = [];
    this.data = {
      chat: new ChatData(),
    };
  }

  clearTimeout() {
    clearTimeout(this.globalTimeoutId);
    this.globalTimeoutId = undefined;
    this.outSocketInformation?.clearTimeout();
  }
  // TODO: 데이터 넣는 로직 추가.
}

interface RoomData {
  chat: ChatData;
  // note?: NoteData;
  // draw?: DrawData;
}
