import { User } from 'src/users/entities/user.entity';
import { SaveDataDto } from '../dto/conversation-data-save.dto';

export class VoiceChatting {
  public voiceChats: VoiceChat[];
  public voiceSummary: string;

  public addChat(chat: VoiceChat) {
    this.voiceChats.push(chat);
  }

  public async toSaveVoiceDataDto(): Promise<SaveDataDto> {
    return { data: JSON.stringify(this.voiceChats), isShared: false };
  }

  public async toSaveSummaryDataDto(): Promise<SaveDataDto> {
    return { data: this.voiceSummary, isShared: false };
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
