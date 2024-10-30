import { Logger } from '@nestjs/common';
import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';

export const logger = new Logger('RoomEvent');

export interface RoomEvent {
  uuid: string;
  status: RoomStatus;
  creatorSocket: RoomSocket;
  participantSocket: RoomSocket;
  watingSockets: RoomSocket[];
  globalTimeoutId: NodeJS.Timeout;
  outSocketInformation: SocketInformation;
}

export function initRoomEvent(roomEvent: RoomEvent, uuid: string) {
  roomEvent.uuid = uuid;
  roomEvent.status = RoomStatus.WATING;
  roomEvent.watingSockets = [];
}

export enum RoomStatus {
  WATING = 'Wating',
  INVITING = 'Inviting',
  RUNNING = 'Running',
  CREATOR_OUT = 'CreatorOut',
  PARTICIPANT_OUT = 'ParticipantOut',
  CLOSING = 'Closing',
}
