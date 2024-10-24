import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class ConversationEventsFilter<T> implements ExceptionFilter {
  private logger: Logger = new Logger('WebsocktFilter');
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const event = ctx.getPattern();
    const client = ctx.getClient<Socket>();
    if (exception instanceof WsException) {
      client.emit('exception', exception);
      return;
    }
    this.logger.debug(exception.stack);
    client.emit('exception', '백엔드 문제');
    return;
  }
}
