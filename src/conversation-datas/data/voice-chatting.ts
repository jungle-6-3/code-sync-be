import { User } from 'src/users/entities/user.entity';
import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';

export class VoiceChatting implements SaveDataDtoConversation {
  public voiceChats: VoiceChat[];
  public voiceSummary: string;

  public addChat(chat: VoiceChat) {
    this.voiceChats.push(chat);
  }

  public async toSaveDataDto() {
    return {
      data: JSON.stringify({
        voiceChats: this.voiceChats,
        voiceSummary: this.voiceSummary,
      }),
      isShared: false,
    };
  }

  constructor() {
    this.voiceChats = [];
  }
}

export class VoiceChat {
  name: string;
  email: string;
  constructor(
    public date: string,
    public message: string,
    user: User,
  ) {
    this.name = user.name;
    this.email = user.email;
  }
}
