import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationDatasController } from './conversation-datas.controller';
import { ConversationDatasService } from './conversation-datas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDatas } from './entities/conversations-data.entity';
import { FileUpload } from './file-upload.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([ConversationDatas]),
  ],
  providers: [ConversationDatasService, FileUpload],
  controllers: [ConversationDatasController],
  exports: [ConversationDatasService],
})
export class ConversationDatasModule {}
