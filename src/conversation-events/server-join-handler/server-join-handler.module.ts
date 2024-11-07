import { Module } from '@nestjs/common';
import { ServerJoinHandlerService } from './server-join-handler.service';
import { SaveYjsService } from './save-yjs.service';
import { YjsModule } from 'src/yjs/yjs.module';

@Module({
  imports: [YjsModule],
  providers: [ServerJoinHandlerService, SaveYjsService],
  exports: [ServerJoinHandlerService],
})
export class ServerJoinHandlerModule {}
