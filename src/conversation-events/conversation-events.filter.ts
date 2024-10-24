import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

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
    const client = ctx.getClient<Socket>();
    if (exception instanceof ConversationException) {
      console.log(exception);
      client.emit('exception', {
        success: false,
        event: event,
        code: exception.code,
        message: exception.message,
      });
      if (exception.withTerminate) {
        client.disconnect(true);
      }
      return;
    }
    if (exception instanceof WsException) {
      client.emit('exception', exception);
    }
    this.logger.debug(exception.stack);
    client.emit('exception', '백엔드 문제');
    return;
  }
}
