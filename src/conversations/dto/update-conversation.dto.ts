import { PartialType } from '@nestjs/swagger';
import { ConversationDto } from './conversation.dto';

export class UpdateConversationDto extends PartialType(ConversationDto) {}
