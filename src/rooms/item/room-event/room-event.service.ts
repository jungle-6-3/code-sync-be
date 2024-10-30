import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RoomSocket } from 'src/conversation-events/room-socket';
import { logger, RoomStatus } from '.';
import { SocketInformation } from 'src/conversation-events/socket-information';
import { User } from 'src/users/entities/user.entity';
import { Room } from '..';
import { RoomsService } from 'src/rooms/rooms.service';
import { RoomSocketService } from 'src/conversation-events/room-socket/room-socket.service';
@Injectable()
export class RoomEventService {
  constructor(
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
    private roomSocketService: RoomSocketService,
  ) {}
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
    await this.disconnectRoomsSockets(room);

    this.roomsService.deleteRoombyUuid(room.uuid);
  }

  async closeRoom(room: Room) {
    this.clearTimeout(room);

    this.logger.log(`${room.uuid}가 닫힘`);
    room.status = RoomStatus.CLOSING;
    room.finishedAt = new Date();

    await this.disconnectRoomsSockets(room);
    this.deleteRoomAfter(room, 30);
  }

  private async disconnectRoomsSockets(room: Room) {
    const { creatorSocket, participantSocket, watingSockets } = room;

    this.roomSocketService.disconenctRoomSocket(creatorSocket);
    this.roomSocketService.disconenctRoomSocket(participantSocket);
    watingSockets.forEach((socket) =>
      this.roomSocketService.disconenctRoomSocket(socket),
    );
  }
}
