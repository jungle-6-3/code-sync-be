import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  disconenctRoomSocket,
  RoomSocket,
} from './interfaces/room-socket.interface';

export interface ConversationError {
  code: string;
  message: string;
  withTerminate: boolean;
}

export class ConversationException extends Error {
  constructor(
    public code: string,
    public message: string,
    public withTerminate: boolean,
  ) {
    super();
  }
}

@Catch()
export class ConversationEventsFilter<T> implements ExceptionFilter {
  private logger: Logger = new Logger('WebsocktFilter');
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const event = ctx.getPattern();
    const client = ctx.getClient<RoomSocket>();
    if (exception instanceof ConversationException) {
      client.emit('exception', {
        success: false,
        event: event,
        code: exception.code,
        message: exception.message,
      });
      if (exception.withTerminate) {
        disconenctRoomSocket(client);
      }
      return;
    }
    if (exception instanceof WsException) {
      client.emit('exception', exception.message);
      return;
    }
    this.logger.debug(exception.stack);
    client.emit('exception', '백엔드 문제');
    return;
  }
}
