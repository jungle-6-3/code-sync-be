import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RoomSocket, SocketStatus } from '../interfaces/room-socket.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ValidateUserIsCreatorPipe implements PipeTransform {
  transform(value: RoomSocket, metadata: ArgumentMetadata) {
    if (value.constructor && value.constructor.name == 'Socket') {
      if (value.status != SocketStatus.CREATOR) {
        throw new WsException(`방에 참여하지 않았습니다.: ${value.status}`);
      }
    }
    return value;
  }
}
