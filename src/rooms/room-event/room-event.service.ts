import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RoomSocket } from 'src/conversation-events/room-socket';
import { logger, RoomStatus } from '.';
import { User } from 'src/users/entities/user.entity';
import { Room } from '../rooms.item';
import { RoomsService } from 'src/rooms/rooms.service';
import { RoomSocketService } from 'src/conversation-events/room-socket/room-socket.service';
import { RoomEventTimerService } from './room-event.timer.service';
@Injectable()
export class RoomEventService {
  constructor(
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
    private roomSocketService: RoomSocketService,
    @Inject(forwardRef(() => RoomEventTimerService))
    private roomEventTimerService: RoomEventTimerService,
  ) {}
  private logger = logger;

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

  rejoinClientInRoom(room: Room, client: RoomSocket) {
    const { outSocketInformation } = room;
    if (outSocketInformation?.userPk != client.user.pk) {
      throw new Error(`이미 개최중이거나 종료중인 방입니다: ${room.status}`);
    }
    outSocketInformation.clearTimeout();
    outSocketInformation.setSocket(client);
    room.outSocketInformation = undefined;

    room.status = RoomStatus.RUNNING;
  }

  async deleteRoom(room: Room) {
    this.roomEventTimerService.clearTimeout(room);

    this.logger.log(`${room.uuid}가 삭제됨`);
    await this.disconnectRoomsSockets(room);

    this.roomsService.deleteRoombyUuid(room.uuid);
  }

  async closeRoom(room: Room) {
    this.roomEventTimerService.clearTimeout(room);

    this.logger.log(`${room.uuid}가 닫힘`);

    await this.disconnectRoomsSockets(room);
    this.roomEventTimerService.deleteRoomAfter(room, 30);
    room.finishedAt = new Date();

    room.status = RoomStatus.CLOSING;
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
