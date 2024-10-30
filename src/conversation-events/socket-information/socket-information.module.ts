import { Module } from '@nestjs/common';
import { SocketInformationService } from './socket-information.service';

@Module({
  providers: [SocketInformationService],
  exports: [SocketInformationService],
})
export class SocketInformationModule {}
