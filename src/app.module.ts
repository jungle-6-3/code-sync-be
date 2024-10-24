import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConversationEventsModule } from './conversation-events/conversation-events.module';
import { ConversationsModule } from './conversations/conversations.module';
import { RoomsModule } from './rooms/rooms.module';
import { ConversationDatasModule } from './conversation-datas/conversation-datas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOSTNAME,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    ConversationEventsModule,
    ConversationsModule,
    RoomsModule,
    ConversationDatasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
