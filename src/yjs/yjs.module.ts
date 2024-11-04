import { Module } from '@nestjs/common';
import { YjsService } from './yjs.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [YjsService],
})
export class YjsModule {}
