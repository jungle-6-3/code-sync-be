import { Injectable, Logger } from '@nestjs/common';
import { Room, RoomStatus } from './room';
import { v4 as _uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import {
  disconenctRoomSocket,
  RoomSocket,
} from 'src/conversation-events/interfaces/room-socket.interface';
import { SocketInformation } from 'src/conversation-events/interfaces/socket-information.interface';

@Injectable()
export class RoomsService {
  private roomsById: Map<string, Room>;
  logger: Logger = new Logger('RoomsService');

  constructor() {
    this.roomsById = new Map();
  }

  async createRoom(creator: User, prUrl: string): Promise<string> {
    const roomUuid = _uuid();
    const newRoom = new Room(roomUuid, creator, prUrl);
    this.roomsById.set(roomUuid, newRoom);
    this.deleteRoomAfter(newRoom, 30);
    this.logger.log(`${creator.name}가 ${roomUuid}를 생성`);
    return roomUuid;
  }

  // TODO: room 내용을 저장하는 행위를 해야함.
  async saveRoom(room: Room, creator: User): Promise<boolean> {
    this.logger.log(`${creator.name}가 ${room.uuid}를 저장`);
    // 저장하는 행위....
    this.deleteRoom(room);
    return true;
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  deleteRoomAfter(room: Room, minute: number) {
    this.logger.log(`${room.uuid}가 ${minute} 후에 삭제`);
    if (room.globalTimeoutId) {
      console.log('deleteRoomAfter 하기 전에 timeoutId가 설정 됨');
    }
    room.globalTimeoutId = setTimeout(
      () => this.deleteRoom(room),
      minute * 60 * 1000,
    );
  }

  closeRoomAfter(room: Room, client: RoomSocket, minute: number) {
    this.logger.log(`${room.uuid}가 ${minute} 후에 닫힘`);
    room.clearTimeout();
    room.outSocketInformation = new SocketInformation(client);

    room.outSocketInformation.timeoutId = setTimeout(
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
    this.logger.log(`${room.uuid}가 삭제됨`);
    room.clearTimeout();

    const { creatorSocket, participantSocket } = room;

    disconenctRoomSocket(creatorSocket);
    disconenctRoomSocket(participantSocket);

    room.watingSockets.forEach((socket) => disconenctRoomSocket(socket));
    this.roomsById.delete(room.uuid);

    room = null;
  }

  async closeRoom(room: Room) {
    this.logger.log(`${room.uuid}가 닫힘`);
    room.clearTimeout();
    room.finishedAt = new Date();

    const { creatorSocket, participantSocket } = room;

    disconenctRoomSocket(creatorSocket);
    disconenctRoomSocket(participantSocket);

    room.watingSockets.forEach((socket) => disconenctRoomSocket(socket));

    this.deleteRoomAfter(room, 30);
  }
}
