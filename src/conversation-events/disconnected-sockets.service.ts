import { Injectable } from '@nestjs/common';
import { DisconnectedSocket } from './interfaces/disconnected-socket.interface';

interface key {
  userPk: number;
  roomUuid: string;
}

@Injectable()
export class DisconnectedSocketsService {
  private userByPk: Map<key, DisconnectedSocket>;
}
