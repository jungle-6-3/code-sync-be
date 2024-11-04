import { SaveDataDto } from '../dto/conversation-data-save.dto';

export interface SaveDataDtoConversation {
  toSaveDataDto: () => SaveDataDto;
}
