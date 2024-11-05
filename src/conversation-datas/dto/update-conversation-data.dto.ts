import { PartialType } from "@nestjs/swagger";
import { ConversationDataSaveDto } from "./conversation-data-save.dto";

export class UpdateConversationDataDto extends PartialType(ConversationDataSaveDto) {}
