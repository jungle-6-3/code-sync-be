export enum RoomStatus {
  WATING = 'Wating',
  RUNNING = 'Running',
  CLOSING1 = 'Closing1',
  CLOSING2 = 'Closing2',
  DELETED = 'Deleted',
}

export class Room {
  uuid: string;

  status: RoomStatus;

  creatorPk: number;

  participantPk: number;

  startedAt: Date;

  finishedAt: Date;

  prUrl: string;

  // Not maid yet.
  // Should define after conversations done
  data: any;

  constructor(uuid: string, creatorPk: string, prUrl: string) {
    this.uuid = uuid;
    this.status = RoomStatus.WATING;
    this.creatorPk = creatorPk;
    this.prUrl = prUrl;
    this.startedAt = new Date();
  }
}
