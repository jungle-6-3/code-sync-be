import { Room } from './room';

export class Rooms {
  private roomsById: Map<string, Room>;
  private roomsByCreator: Map<number, Room>;
  private roomsByParticipant: Map<number, Room>;

  constructor() {
    this.roomsById = new Map();
    this.roomsByCreator = new Map();
    this.roomsByParticipant = new Map();
  }

  async findRoombyUuid(uuid: string): Promise<Room> {
    return this.roomsById.get(uuid);
  }

  async findRoombyCreator(creatorPk: number): Promise<Room> {
    return this.roomsByCreator.get(creatorPk);
  }

  async findRoomByParticipan(participanPk: number): Promise<Room> {
    return this.roomsByParticipant.get(participanPk);
  }
}
