import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { User } from 'src/users/entities/user.entity';

export enum RoomStatus {
  WATING = 'Wating',
  INVITING = 'Inviting',
  RUNNING = 'Running',
  CLOSING1 = 'Closing1',
  CLOSING2 = 'Closing2',
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

  // Not maid yet.
  // Should define after conversations done
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
