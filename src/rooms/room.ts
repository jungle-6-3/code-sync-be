import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { User } from 'src/users/entities/user.entity';

export enum RoomStatus {
  WATING = 'Wating',
  INVITING = 'Inviting',
  RUNNING = 'Running',
  CREATOR_OUT = 'CreatorOut',
  PARTICIPANT_OUT = 'ParticipantOut',
  CLOSING = 'Closing',
  DELETED = 'Deleted',
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

  timeoutId: NodeJS.Timeout;

  // TODO: data의 타입이 정해지면 수정 해야함
  data: any;

  constructor(uuid: string, creator: User, prUrl: string) {
    this.uuid = uuid;
    this.status = RoomStatus.WATING;
    this.creatorPk = creator.pk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
    this.watingSockets = [];
  }
}
