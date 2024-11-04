import { Controller } from '@nestjs/common';
import { ConversationDatasService } from './conversation-datas.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Conversation-datas')
@Controller('conversation-datas')
export class ConversationDatasController {}
