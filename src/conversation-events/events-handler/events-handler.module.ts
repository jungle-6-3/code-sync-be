import { forwardRef, Module } from '@nestjs/common';
import { RoomHandlerService } from './room-handler.service';
import { PeerJsService } from './peer-js.service';
import { ConversationEventsModule } from '../conversation-events.module';

@Module({
  imports: [forwardRef(() => ConversationEventsModule)],
  providers: [RoomHandlerService, PeerJsService],
  exports: [RoomHandlerService, PeerJsService],
})
export class EventsHandlerModule {}
