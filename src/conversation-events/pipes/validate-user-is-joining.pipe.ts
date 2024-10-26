import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RoomSocket, SocketStatus } from '../interfaces/room-socket.interface';
import { WsException } from '@nestjs/websockets';
import { RoomStatus } from 'src/rooms/room';

@Injectable()
export class ValidateUserIsJoiningPipe implements PipeTransform {
  transform(value: RoomSocket, metadata: ArgumentMetadata) {
    if (value.constructor && value.constructor.name == 'Socket') {
      if (
        value.status != SocketStatus.CREATOR &&
        value.status != SocketStatus.PARTICIPANT
      ) {
        throw new WsException(`방에 참여하지 않았습니다.: ${value.status}`);
      }
      const room = value.room;
      if (room.status != RoomStatus.RUNNING) {
        throw new WsException(
          `방의 status가 Running이 아닙니다: ${room.status}`,
        );
      }
    }
    return value;
  }
}
