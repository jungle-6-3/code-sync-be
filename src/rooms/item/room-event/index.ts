import { Logger } from '@nestjs/common';
import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';

export const logger = new Logger('RoomEvent');

export class RoomEvent {
  uuid: string;
  status: RoomStatus;
  creatorSocket: RoomSocket;
  participantSocket: RoomSocket;
  waitingSockets: RoomSocket[];
  globalTimeoutId: NodeJS.Timeout;
  outSocketInformation: SocketInformation;

  constructor(uuid: string) {
    this.uuid = uuid;
    this.status = RoomStatus.WATING;
    this.waitingSockets = [];
  }
}

export enum RoomStatus {
  WATING = 'Wating',
  INVITING = 'Inviting',
  RUNNING = 'Running',
  CREATOR_OUT = 'CreatorOut',
  PARTICIPANT_OUT = 'ParticipantOut',
  CLOSING = 'Closing',
}
