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

  creator: RoomUser;

  participant: RoomUser;

  watingUsers: RoomUser[];

  startedAt: Date;

  finishedAt: Date;

  prUrl: string;

  // Not maid yet.
  // Should define after conversations done
  data: any;

  constructor(uuid: string, creator: User, prUrl: string) {
    this.uuid = uuid;
    this.status = RoomStatus.WATING;
    this.creator = new RoomUser(creator);
    this.prUrl = prUrl;
    this.startedAt = new Date();
  }
}

export class RoomUser {
  pk: number;
  email: string;
  name: string;
  socketId: string;
  peerId: string;

  constructor(user: User) {
    const { pk, email, name } = user;
    this.pk = pk;
    this.email = email;
    this.name = name;
  }
}
