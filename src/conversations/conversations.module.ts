import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationDatas } from 'src/conversation-datas/entities/conversations-data.entity';
import { ConversationDatasModule } from 'src/conversation-datas/conversation-datas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    UsersModule,
    ConversationDatasModule
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
