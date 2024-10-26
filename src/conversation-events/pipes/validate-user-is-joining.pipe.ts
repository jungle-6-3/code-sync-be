import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RoomSocket, SocketStatus } from '../interfaces/room-socket.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ValidateUserIsJoiningPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.constructor && value.constructor.name == 'Socket') {
      if (
        value.status != SocketStatus.CREATOR &&
        value.status != SocketStatus.PARTICIPANT
      ) {
        throw new WsException('방에 참여하지 않았습니다.');
      }
    }
    return value;
  }
}
