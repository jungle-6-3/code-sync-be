import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ConversationDatasService } from './conversation-datas.service';

import { ApiTags } from '@nestjs/swagger';
import { UpdateConversationDataDto } from './dto/update-conversation-data.dto';

@ApiTags('Conversation-datas')
@Controller('conversation-datas')
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
