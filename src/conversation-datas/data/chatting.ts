import { SaveDataDtoConversation } from './save-data-dto-convesation.interface';

export class ChatData implements SaveDataDtoConversation {
  private chats: chat[];

  public addChat(chat: chat) {
    this.chats.push(chat);
  }

  public toSaveDataDto() {
    return {
      data: JSON.stringify(this.chats),
      isShared: false,
    };
  }

  constructor() {
    this.chats = [];
  }
}

interface chat {
  date: string;
  name: string;
  email: string;
  message: string;
}
