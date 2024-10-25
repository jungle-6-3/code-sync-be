import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConversationEventsLoggerService {
  private readonly logger: Logger = new Logger('RoomEventGateway');
  constructor() {}

  getLogger(): Logger {
    return this.logger;
  }
}
