import { User } from 'src/users/entities/user.entity';
import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';

export class VoiceChatting implements SaveDataDtoConversation {
  private voiceChats: VoiceChat[];
  private voiceSummary: string;

  public addChat(chat: VoiceChat) {
    this.voiceChats.push(chat);
  }

  // TODO: 여기 채워야 함
  private async generateSummary() {
    this.voiceSummary = 'sample summary';
  }

  public async toSaveDataDto() {
    await this.generateSummary();
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
