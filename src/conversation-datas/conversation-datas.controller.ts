import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ConversationDatasService } from './conversation-datas.service';

import { ApiTags } from '@nestjs/swagger';
import { UpdateConversationDataDto } from './dto/update-conversation-data.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload';

@ApiTags('Conversation-datas')
@Controller('conversation-datas')
@UseGuards(JwtAuthGuard)
export class ConversationDatasController {
  constructor(private conversationDataService: ConversationDatasService) {}
  @Patch(':dataPk')
  async testApi(
    @Param('dataPk') dataPk: number,
    @Body() updateConversationDataDto: UpdateConversationDataDto,
  ) {
    return await this.conversationDataService.updateConversatoinDatas(
      updateConversationDataDto,
      dataPk,
    );
  }
}
