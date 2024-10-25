import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationDatasController } from './conversation-datas.controller';
import { ConversationDatasService } from './conversation-datas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDatas } from './entities/conversations-data.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([ConversationDatas]),
  ],
  providers: [ConversationDatasService],
  controllers: [ConversationDatasController],
})
export class ConversationDatasModule {}
