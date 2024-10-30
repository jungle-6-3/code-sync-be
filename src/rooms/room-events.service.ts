import { Injectable } from '@nestjs/common';
import {
  disconenctRoomSocket,
  RoomSocket,
} from 'src/conversation-events/interfaces/room-socket.interface';
import { logger, RoomStatus } from './item/room-event';
import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';
import { User } from 'src/users/entities/user.entity';
import { RoomsService } from './rooms.service';
import { Room } from './item';
@Injectable()
export class RoomEventsService {
  constructor(private roomsService: RoomsService) {}
  private logger = logger;

  deleteRoomAfter(room: Room, minute: number) {
    this.logger.log(`${room.uuid}가 ${minute} 후에 삭제`);
    if (room.globalTimeoutId) {
      this.logger.error(
        `deleteRoomAfter 하기 전에 timeoutId가 설정 됨: ${room.uuid}`,
      );
    }
    room.globalTimeoutId = setTimeout(
      () => this.deleteRoom(room),
      minute * 60 * 1000,
    );
  }

  closeRoomAfter(room: Room, client: RoomSocket, minute: number) {
    this.clearTimeout(room);

    this.logger.log(`${room.uuid}가 ${minute} 후에 닫힘`);
    room.outSocketInformation = new SocketInformation(client);

    room.outSocketInformation.timeoutId = setTimeout(
      () => this.closeRoom(room),
      minute * 60 * 1000,
    );
  }

  async findRoomSocket(room: Room, user: User): Promise<RoomSocket> {
    const { creatorSocket, participantSocket, watingSockets } = room;
    if (creatorSocket && creatorSocket.user.pk == user.pk) {
      return creatorSocket;
    }
    if (participantSocket && participantSocket.user.pk == user.pk) {
      return participantSocket;
    }
    const sameWaitingUser = watingSockets.find(
      (socket) => socket.user.pk == user.pk,
    );
    return sameWaitingUser;
  }

  clearTimeout(room: Room) {
    logger.log(`${room.uuid}의 timeout이 제거되었습니다.`);
    clearTimeout(room.globalTimeoutId);
    room.globalTimeoutId = undefined;
    room.outSocketInformation?.clearTimeout();
  }

  async deleteRoom(room: Room) {
    this.clearTimeout(room);

    this.logger.log(`${room.uuid}가 삭제됨`);
    this.disconnectRoomsSockets(room);
    await this.roomsService.deleteRoomByUuid(room.uuid);
  }

  async closeRoom(room: Room) {
    this.clearTimeout(room);

    this.logger.log(`${room.uuid}가 닫힘`);
    room.status = RoomStatus.CLOSING;
    room.finishedAt = new Date();

    this.disconnectRoomsSockets(room);
    this.deleteRoomAfter(room, 30);
  }

  private disconnectRoomsSockets(room: Room) {
    const { creatorSocket, participantSocket, watingSockets } = room;

    disconenctRoomSocket(creatorSocket);
    disconenctRoomSocket(participantSocket);
    watingSockets.forEach((socket) => disconenctRoomSocket(socket));
  }
}
