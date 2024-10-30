import { Module } from '@nestjs/common';
import { SocketInformationService } from './socket-information.service';
import { SocketInformationController } from './socket-information.controller';

@Module({
  controllers: [SocketInformationController],
  providers: [SocketInformationService],
})
export class SocketInformationModule {}
