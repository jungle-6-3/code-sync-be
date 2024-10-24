import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationDatasController } from './conversation-datas.controller';
import { ConversationDatasService } from './conversation-datas.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConversationDatasService],
  controllers: [ConversationDatasController],
})
export class ConversationDatasModule {}
