import { Injectable } from '@nestjs/common';
import { SocketInformation } from './interfaces/socket-information.interface';
import { RoomSocket } from './interfaces/room-socket.interface';
import { RoomsService } from 'src/rooms/rooms.service';
import { Room } from 'src/rooms/room';

interface key {
  userPk: number;
  roomUuid: string;
}

@Injectable()
export class DisconnectedSocketsService {
  constructor(private roomsService: RoomsService) {}

  private userByPk: Map<string, SocketInformation>;

  async findDisconnectedSocket(userPk: number, roomUuid: string) {
    return this.userByPk.get(`${userPk}:${roomUuid}`);
  }

  async setDisconnectedSocket(
    socketInformation: SocketInformation,
    socket: RoomSocket,
  ) {
    socketInformation.timeoutId = setTimeout(() =>
      this.roomsService.deleteRoom(socket.room),
    );
    this.userByPk.set(
      `${socket.user.pk}:${socket.room.uuid}`,
      socketInformation,
    );
  }

  clearTimeout(socketInformation: SocketInformation) {
    clearTimeout(socketInformation.timeoutId);
    this.userByPk.delete(
      `${socketInformation.userPk}:${socketInformation.roomUuid}`,
    );
  }
}
