import { Room } from './room';

export class Rooms {
  private roomsById: Map<string, Room>;
  private roomsByPk: Map<number, Room>;

  constructor() {
    this.roomsById = new Map();
    this.roomsByPk = new Map();
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  async findRoombyPk(userPk: number): Promise<Room> {
    return this.roomsByPk.get(userPk);
  }

  async setRoom(uuid: string, room: Room) {
    this.roomsById.set(uuid, room);
  }

  async joinRoom(userPk: number, room: Room) {
    this.roomsByPk.set(userPk, room);
  }

  async leaveRoom(userPk: number) {
    if (userPk) this.roomsByPk.delete(userPk);
  }

  async deleteRoom(room: Room) {
    this.leaveRoom(room.creatorPk);
    this.leaveRoom(room.participantPk);
    this.roomsById.delete(room.uuid);

    room = null;
  }
}
