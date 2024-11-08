import { PartialType } from '@nestjs/swagger';
import { ResponseUpdateConversationDatasDto } from './response-update-conversation-data.dto';

export class ResponseConversationDataDto extends PartialType(ResponseUpdateConversationDatasDto) {}
