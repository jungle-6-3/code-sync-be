import { Server } from 'socket.io';

export interface OnServerInit {
  afterServerInit(server: Server): void;
}
