import { PartialType } from '@nestjs/swagger';
import { CreateConversationEventDto } from './create-conversation-event.dto';

export class UpdateConversationEventDto extends PartialType(CreateConversationEventDto) {}
