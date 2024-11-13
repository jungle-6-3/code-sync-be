import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { RoomSocket, SocketStatus } from '../interfaces/room-socket.interface';
import { ConversationException } from '../conversation-events.filter';

@Injectable()
export class ValidateUserIsCreatorPipe implements PipeTransform {
  transform(value: RoomSocket, metadata: ArgumentMetadata) {
    if (value.constructor && value.constructor.name == 'Socket') {
      if (value.status != SocketStatus.CREATOR) {
        throw new ConversationException(
          'PERMISSION_1',
          '권한이 없습니다.',
          true,
        );
      }
    }
    return value;
  }
}
