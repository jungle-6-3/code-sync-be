import { Injectable } from '@nestjs/common';
import { Room, RoomStatus } from './room';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { RoomSocket } from 'src/conversation-events/interfaces/room-socket.interface';
import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;

  constructor() {
    this.roomsById = new Map();
  }

  async createRoom(creator: User, prUrl: string): Promise<string> {
    const roomUuid = _uuid();
    const newRoom = new Room(roomUuid, creator, prUrl);
    this.roomsById.set(roomUuid, newRoom);
    this.deleteRoomAfter(newRoom, 30);
    return roomUuid;
  }

  // TODO: room 내용을 저장하는 행위를 해야함.
  async saveRoom(room: Room, creator: User): Promise<boolean> {
    // 저장하는 행위....
    this.deleteRoom(room);
    return true;
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  deleteRoomAfter(room: Room, minute: number) {
    if (room.globalTimeoutId) {
      console.log('deleteRoomAfter 하기 전에 timeoutId가 설정 됨');
    }
    room.globalTimeoutId = setTimeout(
      () => this.deleteRoom(room),
      minute * 60 * 1000,
    );
  }

  closeRoomAfter(room: Room, minute: number) {
    if (room.globalTimeoutId) {
      console.log('closeRoomAfter 하기 전에 timeoutId가 설정 됨');
    }
    room.globalTimeoutId = setTimeout(
      () => this.closeRoom(room),
      minute * 60 * 1000,
    );
  }

  async findRoomSocket(room: Room, user: User): Promise<RoomSocket> {
    if (room.creatorSocket && room.creatorSocket.user.pk == user.pk) {
      return room.creatorSocket;
    }
    if (room.participantSocket && room.participantSocket.user.pk == user.pk) {
      return room.participantSocket;
    }
    const sameWaitingUser = room.watingSockets.find(
      (socket) => socket.user.pk == user.pk,
    );
    return sameWaitingUser;
  }

  async deleteRoom(room: Room) {
    room.clearTimeout();

    const { creatorSocket, participantSocket } = room;
    room.status = RoomStatus.DELETED;
    if (creatorSocket) {
      creatorSocket.disconnect(true);
    }
    if (participantSocket) {
      participantSocket.disconnect(true);
    }
    room.watingSockets.forEach((socket) => socket.disconnect(true));
    this.roomsById.delete(room.uuid);

    room = null;
  }

  async closeRoom(room: Room) {
    room.clearTimeout();

    const { creatorSocket, participantSocket } = room;
    room.status = RoomStatus.DELETED;
    if (creatorSocket) {
      creatorSocket.disconnect(true);
    }
    if (participantSocket) {
      participantSocket.disconnect(true);
    }
    room.watingSockets.forEach((socket) => socket.disconnect(true));

    this.deleteRoomAfter(room, 30);
  }

  setInformationTimeoutId(socketInformation: SocketInformation) {
    socketInformation.timeoutId = setTimeout(() =>
      this.deleteRoom(socketInformation.room),
    );
  }
}
