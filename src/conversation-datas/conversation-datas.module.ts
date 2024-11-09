import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationDatasController } from './conversation-datas.controller';
import { ConversationDatasService } from './conversation-datas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDatas } from './entities/conversations-data.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([ConversationDatas]),
  ],
  providers: [ConversationDatasService, S3Service],
  controllers: [ConversationDatasController],
  exports: [ConversationDatasService],
})
export class ConversationDatasModule {}
