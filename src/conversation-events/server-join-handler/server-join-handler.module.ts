import { Module } from '@nestjs/common';
import { ServerJoinHandlerService } from './server-join-handler.service';
import { SaveYjsService } from './save-yjs.service';
import { SaveVoiceService } from './save-voice.service';

@Module({
  providers: [ServerJoinHandlerService, SaveVoiceService, SaveYjsService],
  exports: [ServerJoinHandlerService],
})
export class ServerJoinHandlerModule {}
